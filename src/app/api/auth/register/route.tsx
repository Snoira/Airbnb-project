import { PrismaClient, User } from "@prisma/client"
import { UserRegistrationData } from "@/types/user"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import {signJWT} from "@/utils/JWT"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body: UserRegistrationData = await request.json()
        console.log("BODY", body)

        if (!body.email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }
        if (!body.name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }
        if (!body.password) {
            return NextResponse.json(
                { error: "Password is required" },
                { status: 400 }
            )
        }
        console.log("bodu validated")

        const isRegistered = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })
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

        const token = await signJWT({userId: newUser.id})

        return NextResponse.json(
            { token },
            { status: 201 }
        )

    } catch (error: any) {
        return NextResponse.json(
            { error: error },
            { status: 400 }
        )
    }
}