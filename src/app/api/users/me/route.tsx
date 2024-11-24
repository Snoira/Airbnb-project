import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/utils/prisma";
import { ValidationError, NotFoundError, DatabaseError, ForbiddenError } from "@/utils/errors";
import { verifySession } from "@/lib/dal";

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        console.log("________________________ GET USER___")
        const userId = request.headers.get("userId")
        if (!userId) throw new ValidationError("Failed to retrieve userId from headers")

        const user = await getUserById(userId, prisma)

        const safeUser = {
            ...user,
            password: undefined
        }

        return NextResponse.json(
            safeUser,
            { status: 200 }
        )

    } catch (error: any) {
        if (error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof DatabaseError)
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            )
    }
}