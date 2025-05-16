import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Listing } from "@prisma/client";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ForbiddenError,
} from "@/utils/errors";
import { deleteDBBookingById, getDBListingById } from "@/utils/prisma";
import { APIOptions } from "@/types/general";
import { getUserIdFromJWT, decrypt } from "@/utils/jwt";
import { z } from "zod";

const listingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  pricePerNight: z.number().min(1, "Price per night is required"),
  reservedDates: z.array(z.date()).optional(),
});

const prisma = new PrismaClient();

export async function GET(request: NextRequest, options: APIOptions) {
  console.log("___________________ \n GET LISTING BY ID \n___________________");

  try {
    const id = options.params.id;

    const listing = await getDBListingById(id);
    if (!listing) throw new NotFoundError("Listing not found");

    return NextResponse.json(listing, { status: 200 });
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, options: APIOptions) {
  console.log("___________________ \n PUT LISTING BY ID \n___________________");
  try {
    const id = options.params.id;

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const userId = await getUserIdFromJWT(JWT);
    if (!userId) throw new ForbiddenError("Unauthorized user");

    const body = listingSchema.parse(await request.json().catch(() => {}));

    const existingListing = await getDBListingById(id);
    if (!existingListing) throw new NotFoundError("Listing not found");
    if (existingListing.createdById !== userId)
      throw new ForbiddenError("No permission to update this listing");

    const newReservedDates = body.reservedDates ?? [];
    const reservedDates = [
      ...existingListing.reservedDates,
      ...newReservedDates,
    ];

    const updatedListing: Listing = await prisma.listing.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        pricePerNight: body.pricePerNight,
        reservedDates,
      },
    });

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
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
      { error: "Internal Server Erroro" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, options: APIOptions) {
  try {
    console.log(
      "___________________ \n DELETE LISTING BY ID \n___________________"
    );

    const id = options.params.id;

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const user = await decrypt(JWT);
    if (!user || !user.id) throw new ForbiddenError("No user id found");

    const listing = await getDBListingById(id);
    if (!listing) throw new NotFoundError("Listing not found");

    if (listing.createdById === user.id || user.role === "ADMIN") {
      await prisma.booking.deleteMany({
        where: {
          listingId: id,
        },
      });

      await prisma.listing.delete({
        where: {
          id,
        },
      });

      return new NextResponse(null, { status: 204 });
    }

    throw new ForbiddenError(
      "You do not have permission to delete this listing"
    );
  } catch (error: unknown) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
