import { PrismaClient } from "@prisma/client";


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
        throw new Error("something went wrong when checking for listing and permission")
    }
}