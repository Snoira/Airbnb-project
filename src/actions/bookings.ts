"use server";
import { Booking, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const getBookingsByListingId = async (
  listingId: string
): Promise<Booking[]> => {

  const bookings = await prisma.booking.findMany({
    where: {
      listingId,
    },
  });

  return bookings;
};
