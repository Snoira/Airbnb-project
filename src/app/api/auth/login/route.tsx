import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { UserLoginData } from "@/types/user"
import { loginValidation } from "@/utils/validators/userValidator"
import bcrypt from "bcrypt"
import { signJWT } from "@/utils/jwt"
import {getUserByEmail} from "@/utils/prisma"
import { NotFoundError } from "@/utils/errors"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: UserLoginData = await request.json()
        console.log("BODY", body)
        const [hasErrors, errors] = loginValidation(body)
        if (hasErrors) {
            return NextResponse.json(
                { errors },
                { status: 400 }
            )
        }
        console.log("validated")

        const user = await getUserByEmail(prisma, body.email.toLowerCase())
        if(!user) throw new NotFoundError("User not found")
        console.log("USER", user)

        const isPasswordMatch: boolean = await bcrypt.compare(body.password, user.password)
        if (!isPasswordMatch) {
            throw new Error("Wrong password")
        }
        console.log("password is a match")

        const token = await signJWT(
            { userId: user.id }
        )

        return NextResponse.json(
            { token: token },
            {status: 200}
        )

    } catch (error: any) {
        console.log("Error: failed to login", error.message)
        return NextResponse.json(
            { message: "user matching credentials not found" },
            { status: 400 }
        )
    }
}