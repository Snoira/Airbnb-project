import { PrismaClient, User, Listing, Booking } from "@prisma/client";
import { DatabaseError, NotFoundError } from "@/utils/errors"

export async function getUserByEmail(client: PrismaClient, email: string): Promise<User | null> {
    try {
        const user = await client.user.findUnique({
            where: {
                email
            }
        })
        return user
    } catch (error) {
        throw new DatabaseError("Something went wrong when looking for user")
    }
}

export async function getUserById(client: PrismaClient, userId: string): Promise<User | null> {
    try {
        const user = await client.user.findUnique({
            where: {
                id: userId
            }
        })

        return user

    } catch (error) {
        throw new DatabaseError("Could not get user")
    }
}

export async function verifyUserById(id: string, client: PrismaClient): Promise<undefined> {
    try {
        const user = await client.user.findUnique({
            where: {
                id
            }
        })

        if (!user) throw new NotFoundError("User not found")

    } catch (error) {
        throw new DatabaseError("Could not verify user by id")
    }
}
export async function checkListingAndPermission(objId: string, client: PrismaClient, userId: string): Promise<[boolean, boolean]> {
    //generellt bra att en funktion bara gör en sak? borde jag bryta ut checkListing i en egen som sen kallas på i denna?
    try {
        //Kan jag göra listing till en param så funktionen kan användas för boooking också?
        const object = await client.listing.findUnique({
            where: {
                id: objId
            }
        })

        const objExists = !!object
        const hasPermission = object?.createdById === userId
        return [objExists, hasPermission]

    } catch (error) {
        //hur funkar error i en importerad funktion? borde jag skicka NotFoundError och ForbiddenError här istället?
        throw new DatabaseError("something went wrong when checking for listing and permission")
    }
}

export async function checkAdmin(userId: string, client: PrismaClient): Promise<boolean> {
    try {
        const user = await client.user.findUnique({
            where: {
                id: userId
            }
        })
        console.log(user)
        const isAdmin = user?.role === "ADMIN"
        return isAdmin

    } catch (error) {
        throw new DatabaseError("Something went wrong when checking role")
    }
}

export async function getListing(listingId: string, client: PrismaClient): Promise<Listing | null> {
    try {
        //återkommer för att testa alternativa lösningar, oklar typing..
        const listing = await client.listing.findUnique({
            where: {
                id: listingId
            }
        })
        return listing

    } catch (error) {
        throw new DatabaseError("something went wrong when getting listing")
    }
}

export async function getBookingById(bookingId: string, client: PrismaClient): Promise<Booking | null> {
    try {
        const booking = await client.booking.findUnique({
            where: {
                id: bookingId
            }
        })
        return booking

    } catch (error) {
        throw new DatabaseError(`Could not get booking`)
    }
}

export async function deleteBookingById(bookingId: string, client: PrismaClient): Promise<undefined> {
    try {
        await client.booking.delete({
            where: {
                id: bookingId
            }
        })

    } catch (error) {
        throw new DatabaseError(`Could not delete booking, id: ${bookingId}`)
    }
}