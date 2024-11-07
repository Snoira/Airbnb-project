import { UserRegistrationData, UserLoginData } from "@/types/user"
import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserById } from "../prisma"
import { ValidationError } from "../errors"


export function registrationValidation(data: UserRegistrationData): [boolean, ErrorObject] {
    let errors: ErrorObject = {}
    if (!data.email) errors.email = "Email is required"
    if (!data.name) errors.name = "Name is required"
    if (!data.password) errors.password = "password is required"

    const hasErrors = Object.keys(errors).length !== 0
    return [hasErrors, errors]
}

export function loginValidation(data: UserLoginData): [boolean, ErrorObject] {
    let errors: ErrorObject = {}
    if (!data.email) errors.email = "Email is required"
    if (!data.password) errors.password = "password is required"

    const hasErrors = Object.keys(errors).length !== 0
    return [hasErrors, errors]
}

//lägg i en egen fil- userHelper? authUtils?
//är denna ens nödvändig?? iom. token? 
export async function getVerifiedUserId(req: NextRequest, client: PrismaClient): Promise<string> {
    const userId = req.headers.get("userId")
    if (!userId) throw new ValidationError("Failed to retrieve userId from headers")
    //try/catch för denna?
    await getUserById(userId, client)
    return userId
}