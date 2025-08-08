import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/utils/errors";
import { deleteDBBookingById, getDBBookingById, getDBListingById } from "@/utils/prisma"
import { generateDateRange } from "@/helpers/bookingHelpers"
import { APIOptions } from "@/types/general";
import { getUserIdFromJWT } from "@/utils/jwt";
import { z } from "zod";

const BookingStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "DENIED"], {
        errorMap: () => ({ message: "Status must be one of: ACCEPTED, DENIED" }),
    })
});


const prisma = new PrismaClient()
// export async function GET(request: NextRequest, options: APIOptions) {
//     try {
//         const id = options.params.id
//         if (!id) throw new ValidationError("Could not get id")

//         const JWT = request.headers.get("Authorization")?.split(" ")[1];
//         const userId = await getUserIdFromJWT(JWT);
//         if (!userId) throw new ForbiddenError("User does not match request");

//         const booking = await getBookingById(id, prisma)

//         // const hasPermission: boolean = (userId === booking.renterId || userId === booking.listingAgentId)
//         // if (!hasPermission) throw new ForbiddenError("User does not have permission to access booking")

//         return NextResponse.json(
//             { booking },
//             { status: 200 }
//         )

//     } catch (error) {
//         if (error instanceof ValidationError ||
//             error instanceof NotFoundError ||
//             error instanceof DatabaseError)
//             return NextResponse.json(
//                 { message: error.message },
//                 { status: error.statusCode }
//             )
//         return NextResponse.json(
//             { error: "Internal Server Error" },
//             { status: 500 }
//         )
//     }
// }

export async function PATCH(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const JWT = request.headers.get("Authorization")?.split(" ")[1];
        if (!JWT) throw new ValidationError("Authorization token is required");

        const userId = await getUserIdFromJWT(JWT);
        if (!userId) throw new ForbiddenError("User does not match request");

        const body = await request.json().catch(() => null);
        const { status: newStatus } = BookingStatusSchema.parse(body);

        const booking = await getDBBookingById(id)
        if (!booking) throw new NotFoundError(`Could not find booking, id: ${id}`)

        if (booking.listingAgentId !== userId) throw new ForbiddenError("User must be listing agent")
        if (booking.status !== "PENDING") throw new ValidationError(`Booking is already set to ${booking.status}`)

        if (newStatus === "DENIED") {
            //vidareutveckling att skapa en ny model med "booked dates" istället för detta?
            const requestedDates = generateDateRange(booking.checkin_date, booking.checkout_date)
            const requestedTimestamps = new Set(requestedDates.map(date => new Date(date).getTime()));

            const listing = await getDBListingById(booking.listingId)
            if (!listing) throw new NotFoundError(`Could not find listing, id: ${booking.listingId}`)

            const reservedDates = listing.reservedDates.filter(date => !requestedTimestamps.has(new Date(date).getTime()));

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
            error instanceof ForbiddenError )
            return NextResponse.json(
                { message: error.message },
                { status: error.statusCode }
            )

        if (error instanceof z.ZodError) {
            const issues = error.issues.map((issue) => issue.message).join(", ");
            return NextResponse.json({ message: issues }, { status: 400 });
        }

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Could not get id")

        const JWT = request.headers.get("Authorization")?.split(" ")[1];
        if (!JWT) throw new ValidationError("Authorization token is required");

        const userId = await getUserIdFromJWT(JWT);
        if (!userId) throw new ForbiddenError("User does not match request");

        const booking = await getDBBookingById(id)
        if (!booking) throw new NotFoundError(`Could not find booking, id: ${id}`)

        if (booking.renterId !== userId) throw new ForbiddenError("User is not allowed to delete booking")

        await deleteDBBookingById(id)

        return new Response(null, { status: 204 })

    } catch (error) {
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