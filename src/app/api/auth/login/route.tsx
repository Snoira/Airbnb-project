import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { UserLoginData } from "@/types/user"
import { loginValidation } from "@/utils/validators/userValidator"
import bcrypt from "bcrypt"
import { signJWT } from "@/utils/jwt"

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

        const user = await prisma.user.findUniqueOrThrow({
            where: {
                email: body.email.toLowerCase()
            }
        })
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