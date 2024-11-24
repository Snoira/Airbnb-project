import { SafeUser } from "@/types/user"

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/users/me/`);

export async function getUser(token: string): Promise<SafeUser | null> {
    try {
        const res = await fetch(url,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  }
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
        console.log("Could not get user", error)
        return null
    }
}