import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ListingData, ListingWithBookings } from "@/types/listing";
import { listingValidation, listingSchema } from "@/utils/validators/listingValidator";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ForbiddenError,
} from "@/utils/errors";
import {
  deleteDBBookingById,
  getDBListingById,
} from "@/utils/prisma";
import { APIOptions } from "@/types/general";
import { getUserIdFromJWT, decrypt } from "@/utils/jwt";


const prisma = new PrismaClient();

export async function GET(request: NextRequest, options: APIOptions) {
  console.log("___________________ \n GET LISTING BY ID \n___________________");

  const id = options.params.id;
  if (!id) throw new ValidationError("Failed to retrive id");

  try {
    const listing = await getDBListingById(id);
    if (!listing) throw new NotFoundError("Listing not found");

    return NextResponse.json(listing, { status: 200 });
  } catch (error: any) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof DatabaseError
    )
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

export async function PUT(request: NextRequest, options: APIOptions) {
  try {
    console.log("___________________ \n PUT LISTING BY ID \n___________________");

    const id = options.params.id;
    if (!id) throw new ValidationError("Failed to retrive id");

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const userId = await getUserIdFromJWT(JWT);
    if (!userId) throw new ForbiddenError("No user id found");

    const body = await request.json().catch(() => {});
    const validation = listingSchema.safeParse(body);
    if (!validation.success) {
      const errorText = validation.error.errors.map((error) => error.path[0] + error.message).join(", ");
      throw new ValidationError(errorText);
    }
    
    const existingListing = await getDBListingById(id);
    if (!existingListing) throw new NotFoundError("Listing not found");
    if (existingListing.createdById !== userId)
      throw new ForbiddenError("User is not allwed to update listing");

    if (!existingListing) throw new NotFoundError("Listing not found");

    const updatedListing = await prisma.listing.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        pricePerNight: body.pricePerNight,
        reservedDates: body.reservedDates,
      },
    });

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError ||
      error instanceof DatabaseError
    )
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );

    return NextResponse.json(
      { error: "Internal Server Erroro" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, options: APIOptions) {
  try {
    console.log("___________________ \n DELETE LISTING BY ID \n___________________");

    const id = options.params.id;
    if (!id) throw new ValidationError("Failed to retrive id");

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const user = await decrypt(JWT);
    if (!user || !user.id ) throw new ForbiddenError("No user id found");

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

  } catch (error: any) {
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
