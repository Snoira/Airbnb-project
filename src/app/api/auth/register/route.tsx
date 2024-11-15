import { PrismaClient, User } from "@prisma/client"
import { UserRegistrationData } from "@/types/user"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { signJWT } from "@/utils/jwt"
import { registrationValidation } from "@/utils/validators/userValidator"
import { getUserByEmail } from "@/utils/prisma"
import { ValidationError } from "@/utils/errors"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: UserRegistrationData = await request.json()
        const [hasErrors, errors] = registrationValidation(body)
        if (hasErrors) throw new ValidationError(`${errors}`)
        //     {
        //     return NextResponse.json(
        //         { error: errors },
        //         { status: 400 }
        //     )
        // }

        const isRegistered = await getUserByEmail(body.email.toLowerCase(), prisma)

        if (isRegistered) throw new ValidationError(`User already exists`)
        //     {
        //     return NextResponse.json(
        //         { error: "User already exists" }, //skriva annat för bättre säkerhet?
        //         { status: 400 }
        //     )
        // }

        const password: string = await bcrypt.hash(body.password, 10);

        const newUser: User = await prisma.user.create({
            data: {
                email: body.email.toLowerCase(),
                password: password,
                name: body.name
            }
        })

        const token = await signJWT({ userId: newUser.id })

        return NextResponse.json(
            { token },
            { status: 201 }
        )

    } catch (error: any) {
        if(error instanceof ValidationError){
            return NextResponse.json(
                {error: error.message},
                {status: error.statusCode}
            )
        }
        return NextResponse.json(
            { error },
            { status: 400 }
        )
    }
}