import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { UserLoginData } from "@/types/user"
import { loginValidation } from "@/utils/validators/userValidator"
import bcrypt from "bcrypt"
import { encrypt } from "@/utils/jwt"
import {getUserByEmail} from "@/utils/prisma"
import { ValidationError } from "@/utils/errors"

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

        const user = await getUserByEmail(body.email.toLowerCase(), prisma)
        if (!user) throw new ValidationError(`Could not find user with match credentials`)
            
            
        const isPasswordMatch: boolean = await bcrypt.compare(body.password, user.password)
        if (!isPasswordMatch) {
            throw new ValidationError(`Could not find user with match credentials`)
        }

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const sessionData: JWTUserPayload = { userId: user.id, expiresAt };
        const token = await encrypt(sessionData);

        return NextResponse.json(
            {token: token}
        )

    } catch (error: any) {
        console.log("Error: failed to login", error.message)
        return NextResponse.json(
            { message: "user matching credentials not found" },
            { status: 400 }
        )
    }
}