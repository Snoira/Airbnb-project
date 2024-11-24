import { Listing, Booking } from "@prisma/client";
import { ListingFormData, ListingWithBookings } from "@/types/listing";
import { verifySession } from "@/lib/dal";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/listings/`);

export async function getListings(q?: string): Promise<Listing[] | null> {
    try {
        const query = q ? `?q=${q}` : ""

        const res = await fetch(`${url}${query}`,
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
        return null
    }
}

export async function getListingsWithBookingsByUserId(q?: string): Promise<ListingWithBookings[] | null> {
    try {
        const query = q ? `q=${q}&` : ""
        const { userId } = await verifySession()

        const res = await fetch(`${url}?${query}with_=bookings&user=${userId}`,
            {
                method: "GET",
                credentials: 'include'
            }
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
        return null
    }
}

export async function createListing(formData: ListingFormData): Promise<Listing | null> {
    try {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(formData),
            credentials: 'include'
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
        return null

    }
}

export async function getListingById(id: string): Promise<Listing | null> {
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
        return null
    }
}

export async function updateListingById(id: string, formData: ListingFormData): Promise<Listing | null> {
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
        return null
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

export async function bookListingById(id: string): Promise<Booking | null> {
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
        return null
    }
}