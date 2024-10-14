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
        const [hasErrors, errors] = loginValidation(body)
        if (hasErrors) {
            return NextResponse.json(
                { errors },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUniqueOrThrow({
            where: {
                email: body.email.toLowerCase()
            }
        })

        const isPasswordMatch: boolean = await bcrypt.compare(body.password, user.password)
        if (!isPasswordMatch) {
            throw new Error("Wrong password")
        }

        const token = await signJWT(
            { userId: user.id }
        )

        return NextResponse.json(
            { token: token }
        )

    } catch (error: any) {
        console.log("Error: failed to login", error.message)
        return NextResponse.json(
            { message: "user matching credentials not found" },
            { status: 400 }
        )
    }
}