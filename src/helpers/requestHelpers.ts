import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserById } from "@/utils/prisma";
import { ValidationError } from "@/utils/errors";

export async function getVerifiedUserId(
  req: NextRequest,
  client: PrismaClient
): Promise<string> {
  const userId = req.headers.get("userId");
  console.log("userId", userId);
  if (!userId)
    throw new ValidationError("Failed to retrieve userId from headers");
  await getUserById(userId, client);
  return userId;
}
