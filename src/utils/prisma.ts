import { PrismaClient, User, Listing, Booking, Role } from "@prisma/client";
import { DatabaseError, NotFoundError } from "@/utils/errors";
import { ListingWithBookings } from "@/types/listing";

export async function getUserByEmail(
  email: string,
  client: PrismaClient
): Promise<User | null> {
  console.log("!!!GETUSERBYEMAIL");
  try {
    const user = await client.user.findUnique({
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

export async function getUserById(
  userId: string,
  client: PrismaClient,
  includeField?: string
): Promise<User> {
  try {
    const includeFieldLookup = includeField
      ? {
          BookingAsRenter: { include: { BookingAsRenter: true } },
          BookingsAsAgent: { include: { BookingAsAgent: true } },
        }[includeField]
      : {};

    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
      ...includeFieldLookup,
    });

    if (!user) throw new NotFoundError(`Could not find user, email: ${userId}`);

    return user;
  } catch (error) {
    throw new DatabaseError("Could not get user");
  }
}

export async function getListingById(
  listingId: string,
  client: PrismaClient,
  includeField?: string
): Promise<Listing> {
  try {
    const include = includeField ? { [includeField]: true } : {};

    const listing = await client.listing.findUnique({
      where: {
        id: listingId,
      },
      // include,
    });

    if (!listing)
      throw new NotFoundError(`Could not find listing, id: ${listingId}`);

    return listing;
  } catch (error) {
    throw new DatabaseError("something went wrong when getting listing");
  }
}

export async function getBookingById(
  bookingId: string,
  client: PrismaClient,
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

    const booking = await client.booking.findUnique({
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

export async function deleteBookingById(
  bookingId: string,
  client: PrismaClient
): Promise<undefined> {
  try {
    await client.booking.delete({
      where: {
        id: bookingId,
      },
    });
  } catch (error) {
    throw new DatabaseError(`Could not delete booking, id: ${bookingId}`);
  }
}

export async function checkAdmin(
  userId: string,
  client: PrismaClient
): Promise<boolean> {
  try {
    //omödig?
    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
    });
    console.log(user);
    //typeof Role.ADMIN
    const isAdmin = user?.role === "ADMIN";
    return isAdmin;
  } catch (error) {
    throw new DatabaseError("Something went wrong when checking role");
  }
}

//onödiga?
// export async function checkListingAndPermission(objId: string, client: PrismaClient, userId: string): Promise<[boolean, boolean]> {
//     //generellt bra att en funktion bara gör en sak? borde jag bryta ut checkListing i en egen som sen kallas på i denna?
//     try {
//         //Kan jag göra listing till en param så funktionen kan användas för boooking också?
//         const object = await client.listing.findUnique({
//             where: {
//                 id: objId
//             }
//         })

//         const objExists = !!object
//         const hasPermission = object?.createdById === userId
//         return [objExists, hasPermission]

//     } catch (error) {
//         //hur funkar error i en importerad funktion? borde jag skicka NotFoundError och ForbiddenError här istället?
//         throw new DatabaseError("something went wrong when checking for listing and permission")
//     }
// }

// export async function verifyUserById(id: string, client: PrismaClient): Promise<undefined> {
//     try {
//         const user = await client.user.findUnique({
//             where: {
//                 id
//             }
//         })

//         if (!user) throw new NotFoundError("User not found")

//     } catch (error) {
//         throw new DatabaseError("Could not verify user by id")
//     }
// }
