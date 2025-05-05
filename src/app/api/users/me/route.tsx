import { PrismaClient } from "@prisma/client";
import { NextApiResponse } from "next";
import { getUserById } from "@/utils/prisma";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ForbiddenError,
} from "@/utils/errors";
import { cookies } from "next/headers";
import { decrypt } from "@/utils/jwt";
const prisma = new PrismaClient();

export async function GET(response: NextApiResponse) {
  try {
    const cookieStore = cookies();
    const JWT = cookieStore.get("session")?.value;
    const sessionData = await decrypt(JWT);

    if (!sessionData?.id) throw new ForbiddenError("User is not authenticated");

    const user = await getUserById(sessionData.id, prisma);

    const { password, ...safeUser } = user;

    return response.json({ status: 200, user: safeUser });
  } catch (error: any) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof DatabaseError
    )
      return response.json({ error: error.message, status: error.statusCode });
  }
}
