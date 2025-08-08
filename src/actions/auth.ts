"use server";

import { RegistrationData, LoginData } from "@/types/user";
import { getDBUserByEmail } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createSession } from "@/utils/jwt";
import { ValidationError } from "@/utils/errors";


const prisma = new PrismaClient();

export async function register(
  formData: RegistrationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const isRegistered = await getDBUserByEmail(formData.email.toLowerCase());
    if (isRegistered) throw new ValidationError("Email already exists");

    const newPassword = await bcrypt.hash(formData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: formData.email.toLowerCase(),
        password: newPassword,
        name: formData.name,
      },
    });

    const sessionData = { role: newUser.role, id: newUser.id };

    await createSession(sessionData);
    return { success: true };

  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Something went wrong, please try again later." };
  }
}

export async function login(
  formData: LoginData
): Promise<{ success: boolean }> {
  const user = await getDBUserByEmail(formData.email.toLowerCase());
  if (!user) return { success: false };

  const isPasswordMatch = await bcrypt.compare(
    formData.password,
    user.password
  );
  if (!isPasswordMatch) return { success: false };

  const sessionData = {
    id: user.id,
    role: user.role,
  };

  await createSession(sessionData);
  return { success: true };
}
