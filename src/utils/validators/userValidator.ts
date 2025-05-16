import { UserRegistrationData, UserLoginData } from "@/types/user"


export function registrationValidation(data: UserRegistrationData): [boolean, string] {

    let errors: string[]= []
    if (!data.email)  errors.push("Email")
    if (!data.name)  errors.push("Name")
    if (!data.password)  errors.push("Password")

    const hasErrors = errors.length !== 0
    const errorText: string = (errors.join(", ")+" is required")
    return [hasErrors, errorText]
}

export function loginValidation(data: UserLoginData): [boolean, string] {
    let errors: string[]= []
    if (!data.email) errors.push("Email")
    if (!data.password) errors.push("Password")

    const hasErrors = errors.length !== 0
    const errorText: string = (errors.join(", ")+" is required")
    return [hasErrors, errorText]
}