"use server";
import { PrismaClient, Listing, Booking } from "@prisma/client";
import { ListingData, ListingWithBookings } from "@/types/listing";
import { cookies } from "next/headers";
import { getJWTFromCookie, decrypt, deleteSession } from "@/utils/jwt";
import { redirect } from "next/navigation";
import { getDBUserById } from "@/utils/prisma";
import { getUserIdFromJWT } from "@/utils/jwt";
import { getDBListingById } from "@/utils/prisma";
import { listingSchema } from "@/utils/validators/listingValidator";

const url = "/api/listings";
const prisma = new PrismaClient();

export async function getListings(): Promise<Listing[] | null> {
  try {
    const listings = await prisma.listing.findMany();
    return listings;
  } catch (error) {
    console.log("could not fetch listing", error);
    return [];
  }
}

export async function getListingsWithBookingsByUserId(userId: string) {
  console.log("\n --GET LISTINGS W BOOKINGS BY USER ID-- \n");

  try {
    const listings = await prisma.listing.findMany({
      where: {
        createdById: userId,
      },
      include: {
        bookings: true,
      },
    });

    return listings;
  } catch (error) {
    console.log("could not fetch listing", error);
    return [];
  }
}

export async function createListing(
  formData: ListingData
): Promise<Listing | null> {
  console.log("\n --CREATE LISTING-- \n");

  const userId = await getUserIdFromJWT();
  if (!userId) {
    await deleteSession();
    return redirect("/signIn");
  }

  const validatedUser = await getDBUserById(userId);
  if (!validatedUser) {
    await deleteSession();
    return redirect("/signIn");
  }

  const reservedDates: Date[] = [];

  const newListing = await prisma.listing.create({
    data: {
      name: formData.name,
      createdById: validatedUser.id,
      description: formData.description,
      location: formData.location,
      pricePerNight: formData.pricePerNight,
      reservedDates,
    },
  });

  return newListing;
}

export async function getListingById(id: string): Promise<Listing | null> {
  return await getDBListingById(id);
}

export async function updateListingById(
  id: string,
  formData: ListingData
): Promise<Listing | null> {
  const userId = await getUserIdFromJWT();
  if (!userId) return redirect("/signIn");

  const updatedListing = await prisma.listing.update({
    where: {
      id,
    },
    data: {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      pricePerNight: formData.pricePerNight,
    },
  });

  return updatedListing;
}

export async function deleteListingById(id: string):Promise<void> {
  const existingListing = await getDBListingById(id);
  if (!existingListing) return;

  await prisma.listing.delete({
    where: {
      id,
    },
  });
}

export async function bookListingById(id: string): Promise<Booking | null> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("session");
    const JWT = await decrypt(session?.value);
    if (!JWT) throw new Error("Could not get JWT");

    const res = await fetch(`${url}/${id}/bookings`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }

    if (res.status === 400) throw new Error("400, Validation error");
    if (res.status === 404) throw new Error("404, Listing not found");
    if (res.status === 500) throw new Error("500, Internal server error");
    throw new Error(`${res.status}`);
  } catch (error) {
    console.log(error);
    return null;
  }
}
