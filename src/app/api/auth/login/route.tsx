import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { UserLoginData } from "@/types/user";
import { loginValidation } from "@/utils/validators/userValidator";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/utils/prisma";
import { ValidationError } from "@/utils/errors";
import * as Jose from "jose";
import { cookies } from "next/headers";
import { SafeUser } from "@/types/user";

const secret: string | undefined = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET environment variable is not set");

const encodedSecret = new TextEncoder().encode(secret);

const prisma = new PrismaClient();

type SessionToken = {
  token: string;
  expiresAt: Date;
};

async function createSessionToken(payload: SafeUser): Promise<SessionToken> {
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

export async function POST(request: NextRequest) {
  try {
    const body: UserLoginData = await request.json();

    const [hasErrors, errors] = loginValidation(body);
    if (hasErrors) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const user = await getUserByEmail(body.email.toLowerCase(), prisma);
    if (!user)
      throw new ValidationError(
        `Could not find user with matching credentials`
      );

    const isPasswordMatch = await bcrypt.compare(body.password, user.password);
    if (!isPasswordMatch) {
      throw new ValidationError(
        `Could not find user with matching credentials`
      );
    }

    const { password, ...safeUser } = user;

    const sessionToken = await createSessionToken(safeUser);
    const cookieStore = await cookies();

    cookieStore.set("session", sessionToken.token, {
      httpOnly: false,
      expires: sessionToken.expiresAt,
      sameSite: "lax",
    });

    // const headers = new Headers();
    // headers.set("set-cookie", `token=${sessionToken.token}`);

    return NextResponse.json(sessionToken, {
      status: 201,
      //   headers,
    });
  } catch (error: any) {
    console.log("Error: failed to login", error.message);
    return NextResponse.json(
      { message: "user matching credentials not found" },
      { status: 400 }
    );
  }
}
