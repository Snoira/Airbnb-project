// import { NextResponse, NextRequest } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import {ValidationError} from "@/utils/errors"

// const prisma = new PrismaClient()

// export async function GET(request: NextRequest){
//     try{
//         const userId = request.headers.get("userId")
//         if (!userId) throw new ValidationError("Could not find Id in header")
            
//         const listings = prisma.listing.findMany({
//             where: {createdById: userId},
//             include: {}
//         })
//     }catch(error: any){

//     }
// }