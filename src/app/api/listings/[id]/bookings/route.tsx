import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError, DatabaseError, ForbiddenError } from "@/utils/errors";
import { bookingData } from "@/types/booking"
import { getListing, verifyUserById } from "@/utils/prisma";
import { differenceInCalendarDays, add, isSameDay } from "date-fns";

const prisma = new PrismaClient()

export async function GET(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")
        //kolla om usern existerar?

        const listing = await prisma.listing.findUnique({
            where: {
                id
            },
            include: {
                bookings: true
            }
        })
        if (!listing) throw new NotFoundError("Couldn't find listing")
        if (listing.createdById !== userId) throw new ForbiddenError("user did not create this listing")

        return NextResponse.json(
            { listing },
            { status: 200 }
        )
    }
    catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError)
            return NextResponse.json(
                { message: error.message },
                { status: error.statusCode }
            )
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}


export async function POST(request: NextRequest, options: APIOptions) {
    try {
        //Bryta ut validerings errors? 
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")
        await verifyUserById(userId, prisma)

        //ÅTERKOM TILL DETTA VID TID 
        // const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
        // if (!objExists) throw new NotFoundError("Listing not found")
        // //byta namn på hasPermission till isMatch eller liknande?
        // if (hasPermission) throw new Error("Can't book your own listing")
        const listing = await getListing(id, prisma) //skicka in objekt som specificerar fält?
        if (!listing) throw new NotFoundError("Listing not found")
        if (listing.createdById === userId) throw new ValidationError("Can't book your own listing")

        //Bryta ut bookingValidation
        const body: bookingData = await request.json()
        const { checkin_date, checkout_date } = body
        if (!checkin_date) throw new ValidationError("Check in date is required")
        if (!checkout_date) throw new ValidationError("Check out date is required")

        // const requestedDates: Date[] = []

        // for (let i = 0; i <= numberOfDays; i++) {
        //     requestedDates.push(
        //         add(new Date(checkin_date), { days: i })
        //     )
        // }
        // if (requestedDates.length < 2) throw new ValidationError("could not create an array of requested dates")

        // const isAvailable = requestedDates.every((requestedDate) => {
        //     return listing.availability.some((availableDate) => {
        //         return isSameDay(new Date(requestedDate), new Date(availableDate))
        //     })
        // })
        const isAvailable = listing.reservedDates?.every((date: Date) => {
            return (date < checkin_date && date > checkout_date)
        })

        if (!isAvailable) throw new ValidationError("Listing is not available during the requested dates")

        const numberOfDays: number = differenceInCalendarDays(checkout_date, checkin_date)
        const totalCost: number = numberOfDays * listing.pricePerNight
        if (!totalCost) throw new ValidationError("Couldn't calculate total cost")

        const newBooking = await prisma.booking.create({
            data: {
                listingId: id,
                listingAgentId: listing.createdById,
                renterId: userId,
                checkin_date: new Date(checkin_date),
                checkout_date: new Date(checkout_date),
                total_cost: totalCost
            }
        })

        return NextResponse.json(
            { newBooking },
            { status: 201 }
        )

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof DatabaseError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.statusCode }
            )
        }

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}