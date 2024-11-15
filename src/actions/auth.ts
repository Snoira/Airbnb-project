const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const url = new URL(`${BASE_URL}api/auth/`);

export async function register(formData: FormData) {
    try {
        const user = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password")
        }

        console.log("User", user)

        const res = await fetch(`${url}register`, {
            method: "POST",
            body: JSON.stringify(user)
        })

        console.log("RES", res)
        if (res.ok) {
            const data = res.json()
            console.log("TOKEN?", data)

        }
        console.log("RES NOT OK", res.status)

    } catch (error) {

    }
}

export async function login(formData: FormData) {
    const user = {
        email: formData.get("email"),
        password: formData.get("password")
    }
    const res = await fetch(`${url}login`, {
        method: "POST",
        body: JSON.stringify(user)
    })
    if (res.ok) {
        const data = res.json()
        console.log("TOKEN?", data)

    }
    console.log("RES NOT OK", res.status)
}
