import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ForbiddenError,
} from "@/utils/errors";
import { getUserIdFromJWT } from "@/utils/jwt";
import { getDBUserById } from "@/utils/prisma";
import { listingValidation } from "@/utils/validators/listingValidator";
import { ListingData } from "@/types/listing";
import { z } from "zod";

// type IncludeObj = {
//   include: {
//     [key: string]: boolean;
//   };
// };

const listingData = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  pricePerNight: z.number().min(1, "Price per night is required"),
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log("\n --CREATE LISTING-- \n");

    const JWT = request.headers.get("Authorization")?.split(" ")[1];
    const userId = await getUserIdFromJWT(JWT);
    if (!userId) throw new ForbiddenError("Unauthorized user");

    const validatedUser = await getDBUserById(userId);
    if (!validatedUser) throw new ForbiddenError("Unauthorized user");

    const body = listingData.parse(await request.json().catch(() => {}));

    const newListing = await prisma.listing.create({
      data: {
        name: body.name,
        createdById: validatedUser.id,
        description: body.description,
        location: body.location,
        pricePerNight: body.pricePerNight,
        reservedDates: [],
      },
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
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

export async function GET(request: NextRequest) {
  console.log("\n --GET LISTINGS-- \n");
  try {
    // const searchParams = new URL(request.url).searchParams;
    // const queries = ["q", "user", "with_"];
    // const [q, user, with_] = queries.map((q) => searchParams.get(q));

    // let where: { [key: string]: any } = {};
    // let include: IncludeObj | {} = {};

    // if (q) {
    //   where.name = {
    //     contains: q,
    //     mode: "insensitive",
    //   };
    // }

    // const JWT = request.headers.get("Authorization")?.split(" ")[1];
    // const sessionData = await decrypt(JWT);
    // const userId = sessionData?.id ?? null;

    // if (user && with_ === "bookings") {
    //   //BORT REQ

    //   if (!userId) throw new ForbiddenError("User does not match request");
    //   const validatedUser = await getDBUserById(userId);
    //   if (!validatedUser) throw new ForbiddenError("User does not match request");

    //   where.createdById = userId;
    //   include = {
    //     include: { bookings: true },
    //   };
    // }

    const listings = await prisma.listing.findMany({
      // where,
      // ...include,
    });

    // if (listings.length === 0) throw new NotFoundError("No listings found");

    return NextResponse.json(listings, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
