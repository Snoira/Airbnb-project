import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { LoginData } from "@/types/user";
import { loginValidation } from "@/utils/validators/userValidator";
import bcrypt from "bcryptjs";
import { getDBUserByEmail } from "@/utils/prisma";
import { ValidationError } from "@/utils/errors";
import * as Jose from "jose";
import { cookies } from "next/headers";
import { SafeUser } from "@/types/user";
import { encrypt } from "@/utils/jwt";

// async function createSessionToken(payload: SafeUser): Promise<SessionToken> {
//   const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
//   try {
//     const token = await new Jose.SignJWT(payload)
//       .setProtectedHeader({ alg: "HS256", typ: "JWT" })
//       .setIssuedAt()
//       .setExpirationTime(expiresAt)
//       .sign(encodedSecret);

//     return { token, expiresAt };
//   } catch (error) {
//     console.error("Error signing JWT:", error);
//     throw new Error("Failed to sign JWT");
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();

    const [hasErrors, errors] = loginValidation(body);
    if (hasErrors) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const user = await getDBUserByEmail(body.email.toLowerCase());

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

    const sessionData = {
      id: user.id,
      role: user.role,
    };

    const JWT = await encrypt(sessionData);

    return NextResponse.json({
      status: 201,
      body: {
        token: JWT,
      },
    });
  } catch (error: any) {
    console.log("Error: failed to login", error.message);
    return NextResponse.json(
      { message: "user matching credentials not found" },
      { status: 400 }
    );
  }
}
