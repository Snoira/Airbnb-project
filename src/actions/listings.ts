import { Listing } from "@prisma/client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/listings/`);

export async function getListings(): Promise<Listing[] | undefined> {
    try {
        const res = await fetch(url,
            { method: "GET" }
        )

        if (res.ok) {
            const data = await res.json()
            return data
        }

        if (res.status === 404) throw new Error("404, Listing not found")
        if (res.status === 500) throw new Error("500, Internal server error")
        throw new Error(`${res.status}`)

    } catch (error) {
        console.log("could not fetch listing", error)
    }
}

export async function getListingById(id: string): Promise<Listing | undefined> {
    try {
        const res = await fetch(`${url}${id}`,
            { method: "GET" }
        )

        if (res.ok) {
            const data = await res.json()
            return data
        }
        if (res.status === 400) throw new Error("400, Validation error")
        if (res.status === 404) throw new Error("404, Listing not found")
        if (res.status === 500) throw new Error("500, Internal server error")
        throw new Error(`${res.status}`)

    } catch (error) {
        console.log(error)
    }
}

// export async function createListing(): Promise <Listing | undefined> {
//     try{
//         const res = await fetch(url, {

//         })
//     }catch(){

//     }
// }