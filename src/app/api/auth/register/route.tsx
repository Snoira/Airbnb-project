import { PrismaClient } from "@prisma/client";
import { RegistrationData } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registrationValidation } from "@/utils/validators/userValidator";
import { getDBUserByEmail } from "@/utils/prisma";
import { ValidationError, DatabaseError } from "@/utils/errors";
import { encrypt } from "@/utils/jwt";
import { z } from "zod";

const prisma = new PrismaClient();

const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = registrationSchema.parse(await request.json().catch(() => {}));

    const isRegistered = await getDBUserByEmail(body.email.toLowerCase());
    if (isRegistered) throw new ValidationError(`User already exists`);

    const newPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
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
  } catch (error: unknown) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ message: issues }, { status: 400 });
    }
    return NextResponse.json({ message: "unknown error" }, { status: 500 });
  }
}
