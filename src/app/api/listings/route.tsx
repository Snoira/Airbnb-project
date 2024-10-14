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
        //har använts i login också, bör brytas ut
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            }
        })
        console.log("USER", user)

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