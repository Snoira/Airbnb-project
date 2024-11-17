import { UserRegistrationData, UserLoginData } from "@/types/user";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/auth/`);

export async function register(formData: UserRegistrationData) {
    try {
        console.log("REGISTER FORMDATA", formData)
        const res = await fetch(`${url}register`, {
            method: "POST",
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            const data = res.json()
            console.log("TOKEN?", data)

        }
        else console.log("RES NOT OK", res.status)

    } catch (error) {
        console.log("ERROR REGISTERFUNC", error)
    }
}

export async function login(formData: UserLoginData) {
    try {
        const res = await fetch(`${url}login`, {
            method: "POST",
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            const data = res.json()
            console.log("TOKEN?", data)

        }
        else console.log("RES NOT OK", res.status)
    } catch (error) {
        console.log("ERROR LOGINFUNC", error)
    }
}
