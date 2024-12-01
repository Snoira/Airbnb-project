import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { ListingData } from "@/types/listing"
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError } from "@/utils/errors"
import { getVerifiedUserId } from "@/helpers/requestHelpers"
import { verifySession } from "@/lib/dal"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        console.log("\n --CREATE LISTING-- \n")
        const body: ListingData = await request.json()
        console.log("body", body)
        //kan använda verifySession här också men jag orkar inte ändra nu
        const userId = await getVerifiedUserId(request, prisma)
        console.log("userid", userId)

        const [hasErrors, errorText] = listingValidation(body)
        if (hasErrors) throw new ValidationError(errorText)
        
        
        if (typeof body.pricePerNight === "string") parseFloat(body.pricePerNight)
        const reservedDates: Date[] = []

        const newListing = await prisma.listing.create({
            data: {
                name: body.name,
                createdById: userId,
                description: body.description,
                location: body.location,
                pricePerNight: body.pricePerNight,
                reservedDates
            }
        })

        console.log("new listing: ", newListing)

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

        console.error("Unexpected error in createListing:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )

    }
}


export async function GET(request: NextRequest) {
    try {

        const searchParams = new URL(request.url).searchParams
        const queries = ["q", "user", "with_"]
        const [q, user, with_] = queries.map(q => searchParams.get(q))

        let where: { [key: string]: any } = {}
        let include: IncludeObj | {} = {}

        if (q) {

            where.name = {
                contains: q,
                mode: "insensitive",
            }
        }

        //snyggar till sen, funkar iaf
        if (user) {
            where.createdById = user

            if (with_) {
                const { isAuth, userId } = await verifySession()

                if (user === userId &&
                    with_ === "bookings" &&
                    isAuth) {

                    include = {
                        include: { bookings: true }
                    }
                }
            }
        }

        const listings = await prisma.listing.findMany({
            where,
            ...include
        })

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
