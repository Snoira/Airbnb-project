import { PrismaClient, User } from "@prisma/client";
import { RegistrationData } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/utils/jwt";
import { registrationValidation } from "@/utils/validators/userValidator";
import { getDBUserByEmail } from "@/utils/prisma";
import { ValidationError, DatabaseError } from "@/utils/errors";
import { encrypt } from "@/utils/jwt";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationData = await request.json();

    const [hasErrors, errorText] = registrationValidation(body);
    if (hasErrors) throw new ValidationError(errorText);

    const isRegistered = await getDBUserByEmail(body.email.toLowerCase());
    if (isRegistered) throw new ValidationError(`User already exists`);

    const newPassword: string = await bcrypt.hash(body.password, 10);

    const newUser: User = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: newPassword,
        name: body.name,
      },
    });

    if (!newUser) throw new DatabaseError(`Could not create user`);

    const sessionData = {
      id: newUser.id,
      role: newUser.role,
    };

    const JWT = await encrypt(sessionData);

    return NextResponse.json({
      status: 201,
      body: {
        token: JWT,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json({ error }, { status: 400 });
  }
}
