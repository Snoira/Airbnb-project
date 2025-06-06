import { ListingForm } from "@/components/ListingForm";
import { Prisma, Listing } from "@prisma/client";
import { z } from "zod";

type ListingData = Pick<
  Listing,
  "name" | "description" | "location" | "pricePerNight"
>;

type ListingWithBookings = Prisma.ListingGetPayload<{
  include: { bookings: true };
}>;

export const listingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  pricePerNight: z.number().min(1, "Price per night is required"),
  reservedDates: z.array(z.date()).optional(),
});

type ListingData = z.infer<typeof listingSchema>;
