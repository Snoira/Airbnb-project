import {z} from "zod";

export const createListingSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  pricePerNight: z
    .number()
    .min(1, { message: "Price per night is required" })
    .refine((val) => !isNaN(val), { message: "Price per night must be a number" }),
});

export const listingSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  pricePerNight: z
    .number()
    .min(1, { message: "Price per night is required" })
    .refine((val) => !isNaN(val), { message: "Price per night must be a number" }),
  reservedDates: z.array(z.date()).optional(),
})
