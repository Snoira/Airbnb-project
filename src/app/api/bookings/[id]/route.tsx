import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { DatabaseError, ForbiddenError, NotFoundError, ValidationError } from "@/utils/errors";
import { verifyUserById, deleteBookingsById } from "@/utils/prisma"
import { bookingData } from "@/types/booking";

const prisma = new PrismaClient()

export async function GET(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to get userId from header")

        const userExists = await verifyUserById(userId, prisma)
        if (!userExists) throw new NotFoundError("Could not find user")

        const booking = await prisma.booking.findUnique({
            where: {
                id
            }
        })

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

export async function DELETE(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to get userId from header")

        const userExists = await verifyUserById(userId, prisma)
        if (!userExists) throw new NotFoundError("Could not find user")

        const body: bookingData = await request.json()
        const { checkin_date, checkout_date } = body
        if (!checkin_date) throw new ValidationError("Check in date is required")
        if (!checkout_date) throw new ValidationError("Check out date is required")

        const booking = await prisma.booking.findUnique({
            where: {
                id
            }
        })

        if (!booking) throw new NotFoundError("could not find booking")
        if (booking.renterId !== userId) throw new ForbiddenError("User is not allowed to delete booking")

        await prisma.booking.delete({
            where: {
                id
            }
        })

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