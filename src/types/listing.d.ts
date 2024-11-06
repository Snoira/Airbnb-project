import { Listing } from "@prisma/client"

type ListingRegisterData = Omit<Listing, "id" | "createdById" | "bookings" | "createdAt" | "updatedAt">
type ListingData = Pick<Listing, "name" | "description" | "location" | "pricePerNight" | "reservedDates">

