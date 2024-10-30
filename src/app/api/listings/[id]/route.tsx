import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ListingRegisterData } from "@/types/listing";
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError, ForbiddenError } from "@/utils/errors"
import { checkListingAndPermission, checkAdmin, getListing } from "@/utils/prisma"
import { bookingData } from "@/types/booking"
import { differenceInCalendarDays, eachDayOfInterval, isSameDay } from "date-fns"

const prisma = new PrismaClient

export async function GET(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    if (!id) throw new ValidationError("Failed to retrive id")

    try {
        const listing = await prisma.listing.findUniqueOrThrow({
            where: {
                id
            }
        })
        if (!listing) throw new NotFoundError("Couldn't find listing")

        return NextResponse.json(
            { listing },
            { status: 200 }
        )
    }
    catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError)
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

export async function PUT(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    if (!id) throw new ValidationError("Failed to retrive id")

    try {
        const userId = request.headers.get("userId")
        //klassas detta verkligen som validation? snarar unauth?
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        const body: ListingRegisterData = await request.json()
        const [hasErrors, errorText] = listingValidation(body)
        if (hasErrors) throw new ValidationError(errorText)

        //använda checkListing istället?
        const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
        if (!objExists) throw new NotFoundError("Listing not found")
        if (!hasPermission) throw new ForbiddenError("You do not have permission to update this listing")

        const updatedListing = await prisma.listing.update({
            where: {
                id
            },
            data: {
                name: body.name,
                description: body.description,
                location: body.location,
                pricePerNight: body.pricePerNight,
                availability: body.availability
            }
        })
        if (!updatedListing) throw new DatabaseError("Failed to update listing")

        return NextResponse.json(
            { updatedListing },
            { status: 200 }
        )

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof DatabaseError)
            return NextResponse.json(
                { message: error.message },
                { status: error.statusCode }
            )

        return NextResponse.json(
            { message: "Internal Server Erroro" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, options: APIOptions) {
    try {
        //Ska kunna raderas oavsett skapare om användare är admin
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        //använda check listing istället?
        const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
        if (!objExists) throw new NotFoundError("Listing not found")
        if (!hasPermission) {
            //finns kanske bättre sätt att lösa? middleware typ?
            const isAdmin = await checkAdmin(userId, prisma)
            if (!isAdmin) throw new ForbiddenError("You do not have permission to update this listing")
        }

        // implementera manuell cascade där alla ookings kopplade till listingen tas bort innan listing tas bort.

        await prisma.listing.delete({
            where: {
                id
            }
        })
        return new Response(null, { status: 204 })

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError
        ) {
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
//annan fil? api/listings/:id/book eller liknande?
export async function POST(request: NextRequest, options: APIOptions) {
    try {
        //Bryta ut validerings errors? 
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        //ÅTERKOM TILL DENNA VID TID 
        // const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
        // if (!objExists) throw new NotFoundError("Listing not found")
        // //byta namn på hasPermission till isMatch eller liknande?
        // if (hasPermission) throw new Error("Can't book your own listing")
        const listing = await getListing(id, prisma)
        if (!listing) throw new NotFoundError("Listing not found")
        if (listing.createdById === userId) throw new ValidationError("Can't book your own listing")

        //Bryta ut bookingValidation
        const body: bookingData = await request.json()
        if (!body.checkin_date) throw new ValidationError("Check in date is required")
        if (!body.checkout_date) throw new ValidationError("Check out date is required")

        // const requestedDates = eachDayOfInterval({
        //     start: new Date(body.checkin_date),
        //     end: new Date(body.checkout_date)
        // })
        const requestedDates: Date[] = []
        let currentDate = new Date(body.checkin_date)

        while (currentDate <= new Date(body.checkout_date)) {
            requestedDates.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }
        if (requestedDates.length < 2) throw new ValidationError("could not create array of requested dates")

        const isAvailable = requestedDates.every((requestedDate) => {
            return listing.availability.some((availableDate) => {
                return isSameDay(new Date(requestedDate), new Date(availableDate))
            })
        })

        if (!isAvailable) throw new ValidationError("Listing is not available during the requested dates")

        const totalCost: number = differenceInCalendarDays(body.checkout_date, body.checkin_date) * listing.pricePerNight
        if (!totalCost) throw new ValidationError("Couldn't calculate total cost")
        
        const newBooking = await prisma.booking.create({
            data: {
                listingId: id,
                renterId: userId,
                checkin_date: new Date(body.checkin_date),
                checkout_date: new Date(body.checkout_date),
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
            error instanceof DatabaseError ||
            error instanceof ForbiddenError)
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