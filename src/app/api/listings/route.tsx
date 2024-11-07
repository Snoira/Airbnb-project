import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { ListingData } from "@/types/listing"
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError } from "@/utils/errors"
import { getVerifiedUserId } from "@/utils/validators/userValidator"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: ListingData = await request.json()

        const userId = await getVerifiedUserId(request, prisma)

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
                { message: error.message },
                { status: error.statusCode }
            )
    }

    return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
    )
}

export async function GET(request: NextRequest) {
    try {
        // const searchParams = new URL(request.url).searchParams
        // const createdById = searchParams.get("createdById")
        //inte optimalt, kommer skapa problem om en person skickar in flera queries. lösa sen.
        // const queryNames: string[] = ["name", "loc"]
        // const searchParams = new URL(request.url).searchParams
        // const [name, loc] = queryNames.map(query => searchParams.get(query))

        // let where: { [key: string]: any } = {}

        // if (name) {
        //     where.name = {
        //         contains: name,
        //         mode: "insensitive"
        //     }
        // }

        // if (loc) {
        //     where.location = {
        //         contains: loc,
        //         mode: "insensitive"
        //     }
        // }
        // lägg price per night använder equals eller gte (greaterThan) och lte(lesserThan) för intervall match
        // lägg till dates. måste bestämma sparande av datum först.

        // const listings = await prisma.listing.findMany({
        //     where
        // })

        //skapa en lösning med include när det behövs?
        const listings = await prisma.listing.findMany()
        if (listings.length === 0) throw new NotFoundError("No listings found")

        return NextResponse.json(
            listings,
            { status: 200 }
        )

    } catch (error: any) {
        if (error instanceof NotFoundError) {
            return NextResponse.json(
                { message: error.message },
                { status: error.statusCode }
            )
        }

        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        )
    }

}
