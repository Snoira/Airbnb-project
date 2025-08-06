import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDBUserByEmail } from "@/utils/prisma";
import { ValidationError } from "@/utils/errors";
import { encrypt } from "@/utils/jwt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: NextRequest) {
  try {
    console.log("___________________ \n LOGIN \n___________________");
    const body = loginSchema.parse(await request.json().catch(() => {}));

    const user = await getDBUserByEmail(body.email.toLowerCase());
    if (!user) {
      throw new ValidationError(
        `Could not find user with matching credentials`
      );
    }

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
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ message: issues }, { status: 400 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json({ message: "unknown error" }, { status: 500 });
  }
}
