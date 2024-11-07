import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ListingData, ListingWithBookings } from "@/types/listing";
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError, ForbiddenError } from "@/utils/errors"
import { checkAdmin, deleteBookingById, getListingById } from "@/utils/prisma"
import { getVerifiedUserId } from "@/utils/validators/userValidator"
import Listing from "@/app/listings/[id]/page";

const prisma = new PrismaClient

export async function GET(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    if (!id) throw new ValidationError("Failed to retrive id")

    try {
        const listing = await getListingById(id, prisma)

        return NextResponse.json(
            listing,
            { status: 200 }
        )
    }
    catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof DatabaseError)
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
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const userId = await getVerifiedUserId(request, prisma)

        const body: ListingData = await request.json()
        const [hasErrors, errorText] = listingValidation(body)
        if (hasErrors) throw new ValidationError(errorText)

        //använda checkListing istället?
        const listing = await getListingById(id, prisma)
        if (listing.createdById !== userId) throw new ForbiddenError("User is not allwed to update listing")

        const updatedListing = await prisma.listing.update({
            where: {
                id
            },
            data: {
                name: body.name,
                description: body.description,
                location: body.location,
                pricePerNight: body.pricePerNight,
                reservedDates: body.reservedDates
            }
        })

        return NextResponse.json(
            updatedListing,
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

        const userId = await getVerifiedUserId(request, prisma)
        console.clear()

        const includeField = "bookings"
        const listing = await getListingById(id, prisma, includeField)

        if (listing.createdById !== userId) {
            //finns kanske bättre sätt att lösa? middleware typ?
            const isAdmin = await checkAdmin(userId, prisma)
            if (!isAdmin) throw new ForbiddenError("You do not have permission to delete this listing")
        }

        // cascade prisma
        // if (listing.bookings?.length > 0) {
        //     const promises = listing.bookings.map((booking) => {
        //         return deleteBookingById(booking.id, prisma)
        //     })
        //     await Promise.all(promises)
        // }

        await prisma.listing.delete({
            where: {
                id
            }
        })

        return new NextResponse(null, { status: 204 })

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof DatabaseError
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
// export async function POST(request: NextRequest, options: APIOptions) {
//     try {
//         //Bryta ut validerings errors?
//         const id = options.params.id
//         if (!id) throw new ValidationError("Failed to retrive id")

//         const userId = request.headers.get("userId")
//         if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

//         //ÅTERKOM TILL DETTA VID TID
//         // const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
//         // if (!objExists) throw new NotFoundError("Listing not found")
//         // //byta namn på hasPermission till isMatch eller liknande?
//         // if (hasPermission) throw new Error("Can't book your own listing")
//         const listing = await getListing(id, prisma) //skicka in objekt som specificerar fält?
//         if (!listing) throw new NotFoundError("Listing not found")
//         if (listing.createdById === userId) throw new ValidationError("Can't book your own listing")

//         //Bryta ut bookingValidation
//         const body: bookingData = await request.json()
//         const {checkin_date, checkout_date} = body
//         if (!checkin_date) throw new ValidationError("Check in date is required")
//         if (!checkout_date) throw new ValidationError("Check out date is required")

//         const numberOfDays:number = differenceInCalendarDays(checkout_date, checkin_date)
//         console.log("NUMBER OF DAYS", numberOfDays)

//         const requestedDates: Date[] = []

//         for(let i = 0; i<= numberOfDays; i++ ){
//             requestedDates.push(
//                 add(new Date(checkin_date), {days: i})
//             )
//         }
//         if (requestedDates.length < 2) throw new ValidationError("could not create an array of requested dates")

//         const isAvailable = requestedDates.every((requestedDate) => {
//             return listing.availability.some((availableDate) => {
//                 return isSameDay(new Date(requestedDate), new Date(availableDate))
//             })
//         })
//         if (!isAvailable) throw new ValidationError("Listing is not available during the requested dates")

//         const totalCost: number = numberOfDays * listing.pricePerNight
//         if (!totalCost) throw new ValidationError("Couldn't calculate total cost")

//         const newBooking = await prisma.booking.create({
//             data: {
//                 listingId: id,
//                 renterId: userId,
//                 checkin_date: new Date(checkin_date),
//                 checkout_date: new Date(checkout_date),
//                 total_cost: totalCost
//             }
//         })

//         return NextResponse.json(
//             { newBooking },
//             { status: 201 }
//         )

//     } catch (error: any) {
//         if (error instanceof ValidationError ||
//             error instanceof NotFoundError ||
//             error instanceof DatabaseError ||
//             error instanceof ForbiddenError) {
//             return NextResponse.json(
//                 { message: error.message },
//                 { status: error.statusCode }
//             )
//         }

//         return NextResponse.json(
//             { message: "Internal Server Error" },
//             { status: 500 }
//         )
//     }
// }