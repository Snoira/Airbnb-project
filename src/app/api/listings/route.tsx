import { PrismaClient, Listing } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { ListingRegisterData } from "@/types/listing"
import { registrationValidation } from "@/utils/validators/listingValidator"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: ListingRegisterData = await request.json()

        const userId = request.headers.get("userId")
        if (!userId) {
            throw new Error("Failed to retrieve userId from headers")
        }

        const [hasErrors, errors] = registrationValidation(body)
        if (hasErrors) {
            return NextResponse.json(
                { errors },
                { status: 400 }
            )
        }
        //har använts i login också, bör brytas ut. redundant pga görs i middleware?
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            }
        })

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
        console.log("NEW", newListing)

        return NextResponse.json(
            { newListing },
            { status: 201 }
        )

    } catch (error: any) {
        //borde inte detta va 500 om errorhantering är tillräcklig i alla andra delar?
        return NextResponse.json(
            { error: "insufficient data, couldn't create new listing" },
            { status: 400 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        //search query filter 
        //vill kunna söka på namn, location
        //filtrera price per night och availability?
        const queryNames: string[] = ["q",]
        const searchParams = new URL(request.url).searchParams
        const [q] = queryNames.map(query => searchParams.get(query))

        let listings: Listing[] = []
        if (q) {
            listings = await prisma.listing.findMany({
                where: {
                    name: {
                        contains: q,
                        mode: "insensitive"
                    }
                }
            })
        } else {
            listings = await prisma.listing.findMany();
        }

        return NextResponse.json(listings);

    } catch (error: any) {
        console.error("Error fetching books:", error)
        return NextResponse.json({ error: "An error occurred" }, { status: 500 })
    }

}
