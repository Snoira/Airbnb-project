import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ListingRegisterData } from "@/types/listing";
import { registrationValidation } from "@/utils/validators/listingValidator"

const prisma = new PrismaClient

export async function GET(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    try {
        const listing = prisma.listing.findUniqueOrThrow({
            where: {
                id
            }
        })

        return NextResponse.json(
            { listing },
            { status: 200 }
        )
    }
    catch (error: any) {
        return NextResponse.json(
            { error: "Listing not found" },
            { status: 404 }
        )
    }
}

export async function PUT(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    try {
        const body: ListingRegisterData = await request.json()
        if (!body) {
            return NextResponse.json(
                { error: "Data has to be sent" },
                { status: 400 }
            )
        }
        const [hasErrors, errors] = registrationValidation(body)
        if (hasErrors) {
            return NextResponse.json(
                { errors },
                { status: 400 }
            )
        }
        const updatedListing = await prisma.listing.update({
            where: {
                id
            },
            data: {
                name: body.name,
                description: body.description,
                location: body.location,
                pricePerNight: body.pricePerNight,
                availability: body.availability
            }
        })
        return NextResponse.json(updatedListing);

    } catch (error: any) {
        return NextResponse.json(
            { message: "Listing not found" },
            { status: 404 }
        )
    }
}

export async function DELETE(request: NextRequest, options: APIOptions) {
    const id = options.params.id;
    try {
        await prisma.listing.delete({
            where: {
                id
            }
        });
        return new Response(null, { status: 204 })

    } catch (error: any) {
        console.warn("error deleting listing", error.message)
        return NextResponse.json(
            { message: "Listing not found" },
            { status: 404 }
        )
    }
}