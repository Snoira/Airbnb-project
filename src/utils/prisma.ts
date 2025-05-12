import { PrismaClient, User, Listing, Booking, Role } from "@prisma/client";
import { DatabaseError, NotFoundError } from "@/utils/errors";

const prisma = new PrismaClient();

export async function getDBUserByEmail(
  email: string,
  client?: PrismaClient
): Promise<User | null> {
  console.log("!!!GETUSERBYEMAIL");

  const db = client ?? prisma; //<<<<<<<<<<<<<<<<<<<<<<<
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch (error) {
    console.log("!!!ERROR", error);
    throw new DatabaseError("Something went wrong when looking for user");
  }
}

export async function getDBUserById(
  userId: string,
  client?: PrismaClient,
  includeField?: string
): Promise<User | null> {
  try {
    const includeFieldLookup = includeField
      ? {
          BookingAsRenter: { include: { BookingAsRenter: true } },
          BookingsAsAgent: { include: { BookingAsAgent: true } },
        }[includeField]
      : {};

    const db = client ?? prisma; //<<<<<<<<<<<<<<<<<<<<<<<

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      ...includeFieldLookup,
    });

    return user;
  } catch (error) {
    throw new DatabaseError("Could not get user");
  }
}

export async function getDBListingById(
  listingId: string,
  client?: PrismaClient,
): Promise<Listing| null> {
  console.log("!!!GETLISTINGBYID");
  try {
    const db = client ?? prisma; //<<<<<<<<<<<<<<<<<<<<<<<

    const listing = await db.listing.findUnique({
      where: {
        id: listingId,
      }
    });

    return listing;
  } catch (error) {
    throw new DatabaseError("something went wrong when getting listing");
  }
}

export async function getDBBookingById(
  bookingId: string,
  client?: PrismaClient,
  includeField?: string
): Promise<Booking> {
  try {
    const includeFieldLookup = includeField
      ? {
          listing: { include: { listing: true } },
          renter: { include: { renter: true } },
          listingAgent: { include: { listingAgent: true } },
        }[includeField]
      : {};

    const db = client ?? prisma; //<<<<<<<<<<<<<<<<<<<<<<<

    const booking = await db.booking.findUnique({
      where: {
        id: bookingId,
      },
      ...includeFieldLookup,
    });

    if (!booking)
      throw new NotFoundError(`Could not find bookng, id: ${bookingId}`);

    return booking;
  } catch (error) {
    throw new DatabaseError(`Could not get booking`);
  }
}

export async function deleteDBBookingById(
  bookingId: string,
  client?: PrismaClient
): Promise<undefined> {
  try {
    const db = client ?? prisma; //<<<<<<<<<<<<<<<<<<<<<<<

    await db.booking.delete({
      where: {
        id: bookingId,
      },
    });
  } catch (error) {
    throw new DatabaseError(`Could not delete booking, id: ${bookingId}`);
  }
}

export async function getDBBookingsByFieldId(field:string, Id:string ):Promise<Booking[]>{
  try {
    console.log("WHERE", {[field]: Id})
    const bookings = await prisma.booking.findMany({
      where: {
        [field]: Id,
      }
    })

    return bookings
  } catch (error) {
    throw new DatabaseError("Could not get bookings by listing id")
  }
}