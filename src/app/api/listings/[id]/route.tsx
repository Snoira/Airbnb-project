import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ListingRegisterData } from "@/types/listing";
import { listingValidation } from "@/utils/validators/listingValidator"
import { ValidationError, NotFoundError, DatabaseError, ForbiddenError } from "@/utils/errors"
import { checkListingAndPermission } from "@/utils/prisma"

const prisma = new PrismaClient

export async function GET(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    if (!id) throw new ValidationError("Failed to retrive id")

    try {
        const listing = await prisma.listing.findUniqueOrThrow({
            where: {
                id
            }
        })
        if (!listing) throw new NotFoundError("Couldn't find listing")

        return NextResponse.json(
            { listing },
            { status: 200 }
        )
    }
    catch (error: any) {
        //känns... överdrivet? kanske inte 
        if (error instanceof ValidationError ||
            error instanceof NotFoundError)
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

export async function PUT(request: NextRequest, options: APIOptions) {
    const id = options.params.id
    if (!id) throw new ValidationError("Failed to retrive id")

    try {
        const userId = request.headers.get("userId")
        //klassas detta verkligen som validation? snarar unauth?
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        const body: ListingRegisterData = await request.json()
        const [hasErrors, errorText] = listingValidation(body)
        if (hasErrors) throw new ValidationError(errorText)

        const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
        if (!objExists) throw new NotFoundError("Listing not found")
        if (!hasPermission) throw new ForbiddenError("You do not have permission to update this listing")

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
        if (!updatedListing) throw new DatabaseError("Failed to update listing")

        return NextResponse.json(
            { updatedListing },
            { status: 200 }
        )

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof DatabaseError)
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

export async function DELETE(request: NextRequest, options: APIOptions) {
    try {
        const id = options.params.id
        if (!id) throw new ValidationError("Failed to retrive id")
            
        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        const [objExists, hasPermission] = await checkListingAndPermission(id, prisma, userId)
        if (!objExists) throw new NotFoundError("Listing not found")
        if (!hasPermission) throw new ForbiddenError("You do not have permission to update this listing")

        await prisma.listing.delete({
            where: {
                id
            }
        })
        return new Response(null, { status: 204 })

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError
        ) {
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
}