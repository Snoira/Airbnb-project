import { UserRegistrationData, UserLoginData } from "@/types/user";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/auth/`);

export async function register(formData: UserRegistrationData): Promise<number> {
    try {

        const res = await fetch(`${url}register`, {
            method: "POST",
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            return res.status
        }

        return res.status

    } catch (error: any) {
        throw new Error(error)
    }
}

export async function login(formData: UserLoginData): Promise<number> {
    try {
        
        const res = await fetch(`${url}login`, {
            method: "POST",
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            return res.status
        }

        return res.status

    } catch (error: any) {
        throw new Error(error)
    }
}
