import { SafeUser } from "@/types/user"
import { getCookie } from "@/lib/dal";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/users/me/`);

export async function getUser(): Promise<SafeUser | null> {
    try {
        const cookie = await getCookie()

        if(!cookie) throw new Error("Could not get cookie in getUser")

        
        const res = await fetch(url,
            {
                method: "GET",
                headers: {
                    cookie: `${cookie}`
                },
                credentials: 'include'
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