import { PrismaClient, Listing } from "@prisma/client";


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

export async function checkAdmin(userId:string, client:PrismaClient): Promise<boolean>{
    try{
        const user = await client.user.findUnique({
        where: {
            id: userId
        }
    })
    console.log(user)
    const isAdmin = user?.role === "ADMIN"
    return isAdmin

}catch(error){
    throw new Error("Something went wrong when checking role")
}
}

export async function checkListing(listingId:string, client: PrismaClient): Promise<[boolean, Listing | null]>{
    try{
        //återkommer för att testa alternativa lösningar, oklar typing..
        const listing = await client.listing.findUnique({
            where: {
                id: listingId
            }
        })
        const listingExists = !!listing
        return [listingExists, listing ? listing : null]

    }catch(error){
        throw new Error("something went wrong when checking listing")
    }
}