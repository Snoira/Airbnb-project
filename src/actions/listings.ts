"use server";
import { PrismaClient, Listing, Booking } from "@prisma/client";
import { ListingData, ListingWithBookings } from "@/types/listing";
import { cookies } from "next/headers";
import { getJWTFromCookie, decrypt } from "@/utils/jwt";
import { redirect } from "next/navigation";
import { getDBUserById } from "@/utils/prisma";
import { getUserIdFromJWT } from "@/utils/jwt";
import { listingValidation } from "@/utils/validators/listingValidator";
import { getDBListingById } from "@/utils/prisma";
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

export async function getListingsWithBookingsByUserId() {
  console.log("\n --GET LISTINGS W BOOKINGS AND USERID-- \n");

  const userId = await getUserIdFromJWT();

  if (!userId) return redirect("/signIn");
  const validatedUser = await getDBUserById(userId);

  try {
    const listings = await prisma.listing.findMany({
      where: {
        createdById: validatedUser.id,
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
  if (!userId) return redirect("/signIn");
  const validatedUser = await getDBUserById(userId);
  if (!validatedUser) return redirect("/signIn");

  const [hasErrors, errorText] = listingValidation(formData);

  if (hasErrors) {
    console.log(errorText);
    return null;
  }

  if (typeof formData.pricePerNight === "string")
    parseFloat(formData.pricePerNight);
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

export async function getListingById(id: string): Promise<Listing> {
  return await getDBListingById(id);
}

export async function updateListingById(
  id: string,
  formData: ListingData
): Promise<Listing | null> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("session");
    const JWT = await decrypt(session?.value);

    const res = await fetch(`${url}/${id}`, {
      method: "PUT",
      body: JSON.stringify(formData),
      credentials: "include",
      headers: {
        cookie: `${JWT}`,
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

export async function deleteListingById(id: string) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("session");
    const JWT = await decrypt(session?.value);

    if (!JWT) throw new Error("Could not get JWT");

    const res = await fetch(`${url}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    });

    if (res.ok) {
      console.log("DELETED", res.status);
    }

    if (res.status === 400) throw new Error("400, Validation error");
    if (res.status === 404) throw new Error("404, Listing not found");
    if (res.status === 500) throw new Error("500, Internal server error");
    throw new Error(`${res.status}`);
  } catch (error) {
    console.log(error);
  }
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
