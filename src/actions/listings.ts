import { Listing, Booking } from "@prisma/client";
import { ListingFormData } from "@/types/listing";

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

export async function createListing(formData: ListingFormData): Promise<Listing | undefined> {
    try {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            const data: Listing = await res.json()
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

export async function updateListingById(id: string, formData: ListingFormData): Promise<Listing | undefined> {
    try {
        const res = await fetch(`${url}${id}`,
            {
                method: "PUT",
                body: JSON.stringify(formData)
            }
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

export async function deleteListingById(id: string) {
    try {
        const res = await fetch(`${url}${id}`,
            {
                method: "DELETE"
            }
        )

        if (res.ok) {
            console.log("DELETED", res.status)
        }

        if (res.status === 400) throw new Error("400, Validation error")
        if (res.status === 404) throw new Error("404, Listing not found")
        if (res.status === 500) throw new Error("500, Internal server error")
        throw new Error(`${res.status}`)

    } catch (error) {
        console.log(error)
    }
}

export async function bookListingById(id: string): Promise<Booking | undefined> {
    try {
        const res = await fetch(`${url}${id}/bookings`,
            {
                method: "POST"
            }
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