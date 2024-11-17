import {User} from "@prisma/client";

type UserRegistrationData = Pick<User, "name" | "email" | "password">;

type UserLoginData = Pick<User, "email" | "password">;