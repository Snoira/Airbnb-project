import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { DatabaseError, ForbiddenError, NotFoundError, ValidationError } from "@/utils/errors";
import { verifyUserById, deleteBookingById, getBookingById } from "@/utils/prisma"
import { bookingData, BookingStatus } from "@/types/booking";

const prisma = new PrismaClient()
//behövs denne egentligen? nås med include annars.
export async function GET(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to get userId from header")
        await verifyUserById(userId, prisma)


        const booking = await getBookingById(id, prisma)
        if (!booking) throw new NotFoundError("Could not find booking")

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
        if (!id) throw new ValidationError

        const body: BookingStatus = await request.json()
        if (!body.status) throw new ValidationError("New status is required")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Cound not get userId from header")
        await verifyUserById(userId, prisma)

        const booking = await getBookingById(id, prisma)
        if (!booking) throw new NotFoundError("Could not find bookng")
        if (booking.status !== "pending") throw new ValidationError(`Booking is already set ${booking.status}`)

        const updatedBooking = await prisma.booking.update({
            where: {
                id
            },
            data: {
                status: body.status
            }
        })

        if (!updatedBooking) throw new DatabaseError("could not update bookingstatus")

        return NextResponse.json(
            { updatedBooking },
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

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to get userId from header")
        await verifyUserById(userId, prisma)

        const body: bookingData = await request.json()
        const { checkin_date, checkout_date } = body
        if (!checkin_date) throw new ValidationError("Check in date is required")
        if (!checkout_date) throw new ValidationError("Check out date is required")

        const booking = await getBookingById(id, prisma)
        if (!booking) throw new NotFoundError("could not find booking")
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