"use server";
import * as Jose from "jose";
import { cookies } from "next/headers";
import { SafeUser } from "@/types/user";
import {Role} from "@prisma/client";

type JWTUserPayload = {
  id: string;
  role: Role;
  iat: number;
  exp: number;
};

type SessionData = {
  id: string;
  role: string;
};

const secret: string = process.env.JWT_SECRET ?? "secret";
const encodedSecret = new TextEncoder().encode(secret);


export async function encrypt(payload: SessionData): Promise<string> {
  return await new Jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5h")
    .sign(encodedSecret);
}

export async function decrypt(
  token: string | undefined
): Promise<JWTUserPayload | null> {
  if (!token) return null;
  try {
    console.log("decrypting token");
    const output = await Jose.jwtVerify(token, encodedSecret, {
      algorithms: ["HS256"],
    });

    return output.payload as JWTUserPayload;
  } catch (error: any) {
    if (error instanceof Jose.errors.JWTExpired) {
      // await deleteSession()
      //implementera funktionalitet som varnar och frågar om ny token ska göras?
      console.error("JWT is invalid:", error.code);
    } else if (error instanceof Jose.errors.JWTInvalid) {
      console.error("JWT is invalid:", error.code);
    } else {
      console.error("JWT verification failed:", error.code);
    }
    return null;
  }
}

export async function createSession(user: SafeUser): Promise<string> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const sessionData = { id: user.id, role: user.role };
  const encryptedSession = await encrypt(sessionData); // Kryptera sessionData- bättre att kalla token?

  const cookieStore = cookies(); // Hämta cookieStore
  cookieStore.set("session", encryptedSession, {
    httpOnly: true,
    secure: false, // TODO: ändra till true i produktion
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  return encryptedSession;
}

export async function deleteSession() {
  const cookieStore = cookies();
  cookieStore.delete("session");
}

export const getJWTFromCookie = async () => {
  const cookieStore = cookies();
  const session = cookieStore.get("session");
  return session?.value;
};

export const checkAuth = async (): Promise<boolean> => {
  const jwt = await getJWTFromCookie();
  if (!jwt) return false;
  const user = await decrypt(jwt);
  return user ? true : false;
};

export const getUserIdFromJWT = async (
  apiJWT?: string | undefined
): Promise<string | null> => {
  const jwt = apiJWT ?? (await getJWTFromCookie());
  if (!jwt) return null;
  const user = await decrypt(jwt);
  return user?.id ?? null;
};
