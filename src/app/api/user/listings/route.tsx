import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError } from "@/utils/errors"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Could not find Id in header")

        const listingsWithBookings = await prisma.listing.findMany({
            where: { createdById: userId },
            include: { bookings: true }
        })
        if (listingsWithBookings.length === 0) throw new NotFoundError("Could not find listings")

        return NextResponse.json(
            { listingsWithBookings },
            { status: 200 }
        )

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError)
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