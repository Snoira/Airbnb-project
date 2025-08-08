import { PrismaClient, User, Listing, Booking } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDBUserByEmail(
  email: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  return user;
}

export async function getDBUserById(
  userId: string,
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  return user;
}

export async function getDBListingById(
  listingId: string,
): Promise<Listing | null> {

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    }
  });

  return listing;
}

export async function getDBBookingById(
  bookingId: string,
): Promise<Booking | null> {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  return booking;
}

export async function deleteDBBookingById(
  bookingId: string,
): Promise<undefined> {
  await prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });

}