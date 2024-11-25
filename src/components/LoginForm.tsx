"use client";
import { useState } from "react";
import * as Yup from "yup"
import { login } from "@/actions/auth";
import { loginFormSchema } from "@/lib/definitions"
import { UserLoginData } from "@/types/user";

type Props = {
    setIsLogedin: React.Dispatch<React.SetStateAction<boolean>>;
  }

export function LoginForm({setIsLogedin}:Props) {
    const [formData, setFormData] = useState<UserLoginData>({
        email: "",
        password: ""
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await loginFormSchema.validate(formData, { abortEarly: false })
            await login(formData)
            setIsLogedin(true)

        } catch (error) {
            // återkommer med bättre errorhantering, form som ger feedback.
            if( error instanceof Yup.ValidationError) {
                const errors = (error.inner.map((err)=> {
                    return( `${err.path}: ${err.message}`)
                }))
                console.log(errors.join(", "))
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-2">
                <label htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >Email</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700"
                >Password</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    type="password"
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                />
            </div>
            <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
                Login</button>
        </form>
    )
}
