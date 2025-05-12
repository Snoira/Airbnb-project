import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Status } from "@prisma/client";
import { ValidationError, NotFoundError, DatabaseError, ForbiddenError } from "@/utils/errors";
import { getDBListingById, getDBUserById  } from "@/utils/prisma";
import { differenceInCalendarDays, add, isSameDay, getDay } from "date-fns";
// import { generateDateRange } from "@/helpers/bookingHelpers"
import { getUserIdFromJWT, decrypt } from "@/utils/jwt";
import { APIOptions } from "@/types/general";
import { boolean } from "zod";


const prisma = new PrismaClient()

export async function GET(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const JWT = request.headers.get("Authorization")?.split(" ")[1];
        const user = await decrypt(JWT);
        if (!user || !user.id) throw new ForbiddenError("No user id found");

        const listing = await getDBListingById(id)
        if (!listing) throw new NotFoundError("Listing not found")

        if (listing.createdById === user.id || user.role === "ADMIN") {
            const bookings = await prisma.booking.findMany({
                where: {
                    listingId: id
                }
            })
            if (!bookings) throw new NotFoundError("Couldn't find listing")

            return NextResponse.json(
                { bookings },
                { status: 200 }
            )
        }

        throw new ForbiddenError("You are not authorized to view this listing's bookings")  
    }
    catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError)
            return NextResponse.json(
                { error: error.message },
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
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")

        const JWT = request.headers.get("Authorization")?.split(" ")[1];
        const userId = await getUserIdFromJWT(JWT);
        if (!userId) throw new ForbiddenError("No user id found");

        const user = await getDBUserById(userId)
        if (!user) throw new ForbiddenError("No user found");
            
        const listing = await getDBListingById(id) //skicka in objekt som specificerar fält?
        
        if (!listing) throw new NotFoundError("Listing not found")
    
        if (listing.createdById === userId) throw new ForbiddenError("Can't book your own listing")
            // or should you be able to book your own listing? add "status" to propery? Active/Paused/Deleted or similar?
        
        const body = await request.json().catch(() => null);
        if (!body) throw new ValidationError("Invalid request body")
        if (!body.checkin_date) throw new ValidationError("Check in date is required")
        if (!body.checkout_date) throw new ValidationError("Check out date is required")

        const checkin_date = new Date(body.checkin_date)
        const checkout_date = new Date(body.checkout_date)

        if (checkin_date >= checkout_date) throw new ValidationError("Check in date must be before check out date")
        if (checkin_date <= new Date()) throw new ValidationError("Check in date must be in the future")
        
        const requestedDates = generateDateRange(checkin_date, checkout_date)
        if (isBooked(requestedDates, listing.reservedDates)) {
            return NextResponse.json(
            { message: "Listing is already booked for the requested dates" },
            { status: 400 }
        )}

        const numberOfDays:number = requestedDates.length
        const totalCost = numberOfDays * listing.pricePerNight

        console.log("Total cost: ", totalCost)

        // only reserved when booking is confirmed? 
        const reservedDates = [...listing.reservedDates, ...requestedDates]
        const updatedListing = await prisma.listing.update({
            where: {
                id: id
            },
            data: {
                reservedDates
            }
        })

        if(!updatedListing) throw new DatabaseError("Couldn't update listing")

        const newBooking = await prisma.booking.create({
            data: {
                listingId: id,
                listingAgentId: listing.createdById,
                renterId: userId,
                checkin_date: checkin_date,
                checkout_date: checkout_date,
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
                { error: error.message },
                { status: error.statusCode }
            )
        }
        console.log("Error", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
} 

function generateDateRange(start: Date, end: Date): Date[] {
    const nrOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dateRange = Array.from({ length: nrOfDays }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });

    return dateRange;
}

function isBooked(requestedDates:Date[], bookedDates: Date[]): boolean {
    let isBooked = false

    for (const date of requestedDates) {
        const containsDate = bookedDates.some(bookedDate => {
            return bookedDate.getTime() === date.getTime()
        })
        if (containsDate) isBooked = true; 
    }
    return isBooked;
}

