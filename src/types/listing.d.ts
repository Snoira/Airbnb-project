import { Prisma, Listing } from "@prisma/client"

type ListingRegisterData = Omit<Listing, "id" | "createdById" | "bookings" | "createdAt" | "updatedAt">
type ListingData = Pick<Listing, "name" | "description" | "location" | "pricePerNight" | "reservedDates" |"createdById">

type ListingWithBookings = Prisma.ListingGetPayload<{
    include: { bookings: true }
}>