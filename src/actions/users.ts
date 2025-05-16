"use server";

import { PrismaClient, ContactInfo } from "@prisma/client";
import { getUserIdFromJWT } from "@/utils/jwt";

const prisma = new PrismaClient();

export const getContactInfoByUserId = async (): Promise<ContactInfo | null> => {
  const userId = await getUserIdFromJWT();
  if (!userId) return null;

  const contactInfo = await prisma.contactInfo.findUnique({
    where: {
      userId,
    },
  });

  return contactInfo;
};
