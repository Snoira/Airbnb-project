import { PrismaClient, Listing } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { ListingRegisterData } from "@/types/listing"
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError } from "@/utils/errors"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: ListingRegisterData = await request.json()
        
        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        const [hasErrors, errorText] = listingValidation(body)//byta namn på funktion?
        if (hasErrors) throw new ValidationError(errorText)

        //har använts i login också, bör brytas ut. redundant pga görs i middleware?
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) throw new NotFoundError("User not found")

        const newListing: Listing = await prisma.listing.create({
            data: {
                name: body.name,
                createdById: userId,
                description: body.description,
                location: body.location,
                pricePerNight: body.pricePerNight,
                availability: body.availability
            }
        }
        )
        if (!newListing) throw new DatabaseError("Failed to create Listing") //onödig?

        return NextResponse.json(
            { newListing },
            { status: 201 }
        )

    } catch (error: any) {
        //borde inte detta va 500 om errorhantering är tillräcklig i alla andra delar?
        if (error instanceof ValidationError ||
            error instanceof NotFoundError || //redirect till logga in eller registrera?
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
        
        const queryNames: string[] = ["name", "loc"]
        const searchParams = new URL(request.url).searchParams
        const [name, loc] = queryNames.map( query => searchParams.get(query))

        let where: {[key: string]: any} ={}

        if(name){
            where.name = {
                contains: name,
                mode: "insensitive"
            }
        }

        if(loc){
            where.location = {
                contains: loc,
                mode: "insensitive"
            }
        }

        // lägg till dates. måste bestämma sparande av datum först.
        // price per night och available dates

        const listings = await prisma.listing.findMany({
            where
        })

        if (listings.length === 0) throw new NotFoundError("No listings found")

        return NextResponse.json(
            {listings},
            {status: 200}
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
