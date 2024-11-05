import { PrismaClient, User } from "@prisma/client"
import { UserRegistrationData } from "@/types/user"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { signJWT } from "@/utils/jwt"
import { registrationValidation } from "@/utils/validators/userValidator"
import {getUserByEmail} from "@/utils/prisma"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: UserRegistrationData = await request.json()
        console.log("BODY", body)

        const [hasErrors, errors] = registrationValidation(body)
        if (hasErrors) {
            return NextResponse.json(
                { error: errors },
                { status: 400 }
            )
        }
        console.log("bodu validated")

        const isRegistered = await getUserByEmail(prisma, body.email.toLowerCase())

        if (isRegistered) {
            return NextResponse.json(
                { error: "User already exists" }, //skriva annat för bättre säkerhet?
                { status: 400 }
            )
        }

        const password: string = await bcrypt.hash(body.password, 10);
        console.log("PASSWORD", password)

        const newUser: User = await prisma.user.create({
            data: {
                email: body.email.toLowerCase(),
                password: password,
                name: body.name
            }
        }
        )

        const token: string = await signJWT({ userId: newUser.id }) //onödigt att ha :string eftersom signJWT Promise<string>?

        return NextResponse.json(
            { token },
            { status: 201 }
        )

    } catch (error: any) {
        return NextResponse.json(
            { error },
            { status: 400 }
        )
    }
}