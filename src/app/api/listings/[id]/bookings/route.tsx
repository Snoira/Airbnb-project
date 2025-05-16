import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ContactInfo } from "@prisma/client";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ForbiddenError,
} from "@/utils/errors";
import { getDBListingById, getDBUserById } from "@/utils/prisma";
import { generateDateRange } from "@/helpers/bookingHelpers";
import { getUserIdFromJWT, decrypt } from "@/utils/jwt";
import { APIOptions } from "@/types/general";
import { z } from "zod";

const contactInfoSchema = z.object({
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});
const bookingSchema = z.object({
  checkin_date: z.string().min(1, "Check in date is required"),
  checkout_date: z.string().min(1, "Check out date is required"),
  contactInfo: contactInfoSchema.optional(),
});

const prisma = new PrismaClient();

export async function GET(request: NextRequest, options: APIOptions) {
  try {
    const id = options.params.id;

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const user = await decrypt(JWT);
    if (!user || !user.id) throw new ForbiddenError("No user id found");

    const listing = await getDBListingById(id);
    if (!listing) throw new NotFoundError("Listing not found");

    if (listing.createdById === user.id || user.role === "ADMIN") {
      const bookings = await prisma.booking.findMany({
        where: {
          listingId: id,
        },
      });

      if (!bookings) throw new NotFoundError("Couldn't find listing");

      return NextResponse.json({ bookings }, { status: 200 });
    }

    throw new ForbiddenError(
      "You are not authorized to view this listing's bookings"
    );
  } catch (error: unknown) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError)
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, options: APIOptions) {
  try {
    const id = options.params.id;

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const userId = await getUserIdFromJWT(JWT);
    if (!userId) throw new ForbiddenError("No user id found");

    const user = await getDBUserById(userId);
    if (!user) throw new ForbiddenError("No user found");

    const listing = await getDBListingById(id);
    if (!listing) throw new NotFoundError("Listing not found");

    if (listing.createdById === userId)
      throw new ForbiddenError("Can't book your own listing");
    // or should you be able to book your own listing? add "status" to propery? Active/Paused/Deleted or similar?

    const body = bookingSchema.parse(await request.json().catch(() => {}));

    let contactInfo: ContactInfo | null = await prisma.contactInfo.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!contactInfo) {
      if (!body.contactInfo) {
        throw new ValidationError("Contact info is required");
      }
      contactInfo = await prisma.contactInfo.create({
        data: {
          userId: userId,
          email: body.contactInfo.email,
          phoneNumber: body.contactInfo.phoneNumber,
          firstName: body.contactInfo.firstName,
          lastName: body.contactInfo.lastName,
        },
      });
    }

    if (!contactInfo) new DatabaseError("Couldn't create contact info");

    const checkin_date = new Date(body.checkin_date);
    const checkout_date = new Date(body.checkout_date);

    if (checkin_date >= checkout_date)
      throw new ValidationError("Check in date must be before check out date");
    if (checkin_date <= new Date())
      throw new ValidationError("Check in date must be in the future");

    const requestedDates = generateDateRange(checkin_date, checkout_date);
    if (isBooked(requestedDates, listing.reservedDates)) {
      throw new ValidationError(
        "Listing is already booked for the requested dates"
      );
    }

    const totalCost = requestedDates.length * listing.pricePerNight;

    // only reserved when booking is confirmed?
    const reservedDates = [...listing.reservedDates, ...requestedDates];
    const updatedListing = await prisma.listing.update({
      where: {
        id: id,
      },
      data: {
        reservedDates,
      },
    });

    if (!updatedListing) throw new DatabaseError("Couldn't update listing");

    const newBooking = await prisma.booking.create({
      data: {
        listingId: id,
        listingAgentId: listing.createdById,
        renterId: userId,
        contactInfoId: contactInfo.id,
        checkin_date: checkin_date,
        checkout_date: checkout_date,
        total_cost: totalCost,
      },
    });

    return NextResponse.json({ newBooking }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError ||
      error instanceof DatabaseError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ message: issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function isBooked(requestedDates: Date[], bookedDates: Date[]): boolean {
  let isBooked = false;

  for (const date of requestedDates) {
    const containsDate = bookedDates.some((bookedDate) => {
      return bookedDate.getTime() === date.getTime();
    });
    if (containsDate) isBooked = true;
  }
  return isBooked;
}
