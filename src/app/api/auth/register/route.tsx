import { PrismaClient, User } from "@prisma/client";
import { UserRegistrationData } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/utils/jwt";
import { registrationValidation } from "@/utils/validators/userValidator";
import { getUserByEmail } from "@/utils/prisma";
import { ValidationError } from "@/utils/errors";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistrationData = await request.json();

    const [hasErrors, errorText] = registrationValidation(body);
    if (hasErrors) throw new ValidationError(errorText);

    const isRegistered = await getUserByEmail(body.email.toLowerCase(), prisma);
    if (isRegistered) throw new ValidationError(`User already exists`);

    const newPassword: string = await bcrypt.hash(body.password, 10);

    const newUser: User = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: newPassword,
        name: body.name,
      },
    });

    const { password, ...safeUser } = newUser;

    await createSession(safeUser);

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json({ error }, { status: 400 });
  }
}
