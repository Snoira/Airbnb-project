import {Booking} from "@prisma/client"

type bookingData = Omit<Booking, "id" | "renterId" | "listingId" | "total_cost" | "createdAt" | "updatedAt" | "status">