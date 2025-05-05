"use server";
import * as Jose from "jose";
import { cookies } from "next/headers";
import { SafeUser } from "@/types/user";
import { SessionToken } from "@/types/general";

type JWTUserPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  iat: number;
  exp: number;
};

type SessionData = {
  user: SafeUser;
  expiresAt: Date;
};

const secret: string = process.env.JWT_SECRET ?? "secret";
const encodedSecret = new TextEncoder().encode(secret);

//radera senare??
// The payload should contain the minimum, unique user data that'll be used
// in subsequent requests, such as the user's ID, role, etc.
// It should not contain personally identifiable information like phone number,
//  email address, credit card information, etc, or sensitive data like passwords.
export async function encrypt(payload: SessionData): Promise<string> {
  return await new Jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5h")
    .sign(encodedSecret);
}

export async function createSessionToken(
  payload: SafeUser
): Promise<SessionToken> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
  try {
    const token = await new Jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(encodedSecret);

    return { token, expiresAt };
  } catch (error) {
    console.error("Error signing JWT:", error);
    throw new Error("Failed to sign JWT");
  }
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
  const sessionData = { user, expiresAt };
  const encryptedSession = await encrypt(sessionData); // Kryptera sessionData- bättre att kalla token?

  const cookieStore = await cookies(); // Hämta cookieStore
  cookieStore.set("session", encryptedSession, {
    httpOnly: true,
    secure: false, // TODO: ändra till true i produktion
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
  return encryptedSession;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
