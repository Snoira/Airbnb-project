import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Status } from "@prisma/client";
import { DatabaseError, ForbiddenError, NotFoundError, ValidationError } from "@/utils/errors";
import { deleteBookingById, getBookingById, getListingById } from "@/utils/prisma"
import { bookingData, BookingStatus } from "@/types/booking";
import { generateDateRange } from "@/helpers/bookingHelpers"
import { getVerifiedUserId } from "@/helpers/requestHelpers";

const prisma = new PrismaClient()
//behövs denne egentligen? nås med include annars.
export async function GET(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const userId = await getVerifiedUserId(request, prisma)

        const booking = await getBookingById(id, prisma)

        const hasPermission: boolean = (userId === booking.renterId || userId === booking.listingAgentId)
        if (!hasPermission) throw new ForbiddenError("User does not have permission to access booking")

        return NextResponse.json(
            { booking },
            { status: 200 }
        )

    } catch (error) {
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

export async function PATCH(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const userId = await getVerifiedUserId(request, prisma)

        const body: BookingStatus = await request.json()
        if (!body.status) throw new ValidationError("Booking status is requried")

        const newStatus = body.status

        //egentligen är bara accepted och denied relevant, men detta får funka nu.
        const statusValues = Object.values(Status)

        if (!statusValues.includes(newStatus)) throw new ValidationError(`Status not one of: ${statusValues.join(", ")}`)

        const booking = await getBookingById(id, prisma)

        if (!booking) throw new NotFoundError(`Could not find bookng, id: ${id}`)

        if (booking.listingAgentId !== userId) throw new ForbiddenError("User must be listing agent")

        if (booking.status !== "pending") throw new ValidationError(`Booking is already set to ${booking.status}`)

        if (newStatus === "accepted") {
            //vidareutveckling att skapa en ny model med "booked dates" istället för detta?
            const requestedDates = generateDateRange(booking.checkin_date, booking.checkout_date)

            const listing = await getListingById(booking.listingId, prisma)
            if (!listing) throw new NotFoundError(`Could not find listing, id: ${booking.listingId}`)

            const reservedDates = listing.reservedDates.concat(requestedDates)

            await prisma.listing.update({
                where: {
                    id: listing.id
                },
                data: {
                    reservedDates
                }
            })
        }

        const updatedBooking = await prisma.booking.update({
            where: {
                id
            },
            data: {
                status: newStatus
            }
        })

        return NextResponse.json(
            updatedBooking,
            { status: 200 }
        )

    } catch (error) {
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
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const userId = await getVerifiedUserId(request, prisma)

        const booking = await getBookingById(id, prisma)
        if (booking.renterId !== userId) throw new ForbiddenError("User is not allowed to delete booking")

        await deleteBookingById(id, prisma)

        return new Response(null, { status: 204 })

    } catch (error) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof DatabaseError ||
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