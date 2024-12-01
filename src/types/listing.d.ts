import { Prisma, Listing } from "@prisma/client"

type ListingData = Pick<Listing, "name" | "description" | "location" | "pricePerNight" |"createdById">

type ListingFormData = Pick<Listing, "name" | "description" | "location" | "pricePerNight" >

type ListingWithBookings = Prisma.ListingGetPayload<{
    include: { bookings: true }
}>