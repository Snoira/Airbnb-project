"use server";

import { RegistrationData, LoginData } from "@/types/user";
import {
  loginValidation,
  registrationValidation,
} from "@/utils/validators/userValidator";
import { getDBUserByEmail } from "@/utils/prisma";
import { ValidationError } from "@/utils/errors";
import bcrypt from "bcryptjs";
import { PrismaClient, User } from "@prisma/client";
import { createSession } from "@/utils/jwt";

const prisma = new PrismaClient();

export async function register(
  formData: RegistrationData
): Promise<{ success: boolean }> {
  const isRegistered = await getDBUserByEmail(formData.email.toLowerCase());
  if (isRegistered) return { success: false };

  const newPassword = await bcrypt.hash(formData.password, 10);

  const newUser: User = await prisma.user.create({
    data: {
      email: formData.email.toLowerCase(),
      password: newPassword,
      name: formData.name,
    },
  });

  const sessionData = { role: newUser.role, id: newUser.id };

  await createSession(sessionData);
  return { success: true };
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
