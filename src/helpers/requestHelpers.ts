import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserById } from "@/utils/prisma"
import { ValidationError } from "@/utils/errors"

//är denna ens nödvändig?? iom. token? 
export async function getVerifiedUserId(req: NextRequest, client: PrismaClient): Promise<string> {
    const userId = req.headers.get("userId")
    if (!userId) throw new ValidationError("Failed to retrieve userId from headers")
    //try/catch för denna?
    await getUserById(userId, client)
    return userId
}