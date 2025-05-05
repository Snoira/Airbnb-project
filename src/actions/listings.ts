"use server";
import { Listing, Booking } from "@prisma/client";
import { ListingFormData, ListingWithBookings } from "@/types/listing";
import { cookies } from "next/headers";
import { getJWTFromCookie, decrypt } from "@/utils/jwt";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { getUserById } from "@/utils/prisma";

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

  const JWT = await getJWTFromCookie();
  const sessionData = await decrypt(JWT);
  const userId = sessionData?.id ?? null;

  if (!userId) return redirect("/");
  const validatedUser = await getUserById(userId, prisma);

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
  formData: ListingFormData
): Promise<number | null> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("session");
    const JWT = await decrypt(session?.value);

    if (!JWT) throw new Error("Could not get cookie");

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      credentials: "include",
    });

    if (res.ok) {
      const data: Listing = await res.json();
      console.log("RES OK LISTING", data);
      return res.status;
      //Visar listing här men ej i clienten ListingForm, oklart varför- middleware?
      //return data
    }

    if (res.status === 400) throw new Error("400, Validation error");
    if (res.status === 404) throw new Error("404, Listing not found");
    if (res.status === 500) throw new Error("500, Internal server error");

    // throw new Error(`${res.status}`)
    return null;
  } catch (error: any) {
    console.log("Error createListing", error);
    return null;
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${url}/${id}`, { method: "GET" });

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

export async function updateListingById(
  id: string,
  formData: ListingFormData
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
