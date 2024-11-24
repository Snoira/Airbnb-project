import { UserRegistrationData, UserLoginData } from "@/types/user";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/auth/`);

export async function register(formData: UserRegistrationData): Promise<string> {
    try {
        console.log("REGISTER FORMDATA", formData)
        const res = await fetch(`${url}register`, {
            method: "POST",
            body: JSON.stringify(formData)
        })

        if (!res.ok) {
            const errorObj = res.json()
            throw new Error(`RES NOT OK ${errorObj}`)
        }

        const data = await res.json()

        return data.token

    } catch (error) {
        console.log("ERROR REGISTERFUNC", error)
        throw new Error("Could not regiser user")
    }
}

export async function login(email: string, password: string): Promise<string> {
    try {
        const formData = {email, password}

        const res = await fetch(`${url}login`, {
            method: "POST",
            body: JSON.stringify( formData )
        })

        if (!res.ok) {
            const errorObj = res.json()
            throw new Error(`RES NOT OK ${errorObj}`)

        }
        const data = await res.json()

        return data.token
        

    } catch (error: any) {
        console.log("ERROR LOGINFUNC", error)
        throw new Error("Could not log in")
    }
}
