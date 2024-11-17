import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { ListingData } from "@/types/listing"
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError } from "@/utils/errors"
import { getVerifiedUserId } from "@/helpers/requestHelpers"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: ListingData = await request.json()

        // const userId = await getVerifiedUserId(request, prisma)
        if(!body.createdById) throw new ValidationError("no createdById")
        const userId = body.createdById 

        const [hasErrors, errorText] = listingValidation(body)
        if (hasErrors) throw new ValidationError(errorText)

        const newListing = await prisma.listing.create({
            data: {
                name: body.name,
                createdById: userId,
                description: body.description,
                location: body.location,
                pricePerNight: body.pricePerNight,
                reservedDates: body.reservedDates
            }
        })

        return NextResponse.json(
            newListing,
            { status: 201 }
        )

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof DatabaseError)
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            )
    }

    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
    )
}

export async function GET(request: NextRequest) {
    try {
        const listings = await prisma.listing.findMany()
        if (listings.length === 0) throw new NotFoundError("No listings found")

        return NextResponse.json(
            listings,
            { status: 200 }
        )

    } catch (error: any) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            )
        }

        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        )
    }

}
