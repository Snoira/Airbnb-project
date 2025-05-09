import { User } from "@prisma/client";

type RegistrationData = Pick<User, "name" | "email" | "password">;

type LoginData = Pick<User, "email" | "password">;

export type SafeUser = Omit<User, "password">;
