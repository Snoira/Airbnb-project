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
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// export async function register(
//   formData: UserRegistrationData
// ): Promise<number> {
//   try {
//     const res = await fetch(`${url}register`, {
//       method: "POST",
//       body: JSON.stringify(formData),
//     });

//     if (res.ok) {
//       return res.status;
//     }

//     return res.status;
//   } catch (error: any) {
//     throw new Error(error);
//   }
// }

export async function register(formData: RegistrationData) {
  const [hasErrors, errorText] = registrationValidation(formData);
  if (hasErrors) console.error(errorText);

  const isRegistered = await getDBUserByEmail(
    formData.email.toLowerCase(),
    prisma
  );
  if (isRegistered) console.error(`User already exists`);

  const newPassword: string = await bcrypt.hash(formData.password, 10);

  try {
    const newUser: User = await prisma.user.create({
      data: {
        email: formData.email.toLowerCase(),
        password: newPassword,
        name: formData.name,
      },
    });

    const { password, ...safeUser } = newUser;

    await createSession(safeUser);
    return redirect("/dashboard");
  } catch (error: any) {
    console.error("register user error ", error);
  }
}

export async function login(formData: LoginData) {
  const [hasErrors, errors] = loginValidation(formData);
  if (hasErrors) {
    console.log(errors);
    return { success: false };
  }
  const user = await getDBUserByEmail(formData.email.toLowerCase(), prisma);
  if (!user)
    throw new ValidationError(`Could not find user with matching credentials`);

  const isPasswordMatch = await bcrypt.compare(
    formData.password,
    user.password
  );
  if (!isPasswordMatch) {
    throw new ValidationError(`Could not find user with matching credentials`);
  }

  const { password, ...safeUser } = user;
  try {
    await createSession(safeUser);
    return { success: true };
  } catch (error: any) {
    console.error("login user error ", error);
    return { success: false };
  }
}

// export async function login(formData: UserLoginData): Promise<number> {
//   try {
//     const res = await fetch(`${url}login`, {
//       method: "POST",
//       body: JSON.stringify(formData),
//     });

//     if (res.ok) {
//       return res.status;
//     }
//     return res.status;
//   } catch (error: any) {
//     throw new Error(error);
//   }
// }
