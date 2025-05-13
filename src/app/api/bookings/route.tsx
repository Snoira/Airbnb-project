// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import {
//   DatabaseError,
//   ForbiddenError,
//   NotFoundError,
//   ValidationError,
// } from "@/utils/errors";
// import { getVerifiedUserId } from "@/helpers/requestHelpers";

// const prisma = new PrismaClient();

// export async function GET(request: NextRequest,) {
//   try {


//     await getVerifiedUserId(request, prisma);

//     const bookings = await prisma.booking.findMany({
//       where: {
//         listingId: id,
//       },
//       include: {
//         renter: true,
//       },
//     });

//     if (bookings.length === 0) throw new NotFoundError("Couldn't find listing");

//     return NextResponse.json(bookings, { status: 200 });
//   } catch (error: any) {
//     if (
//       error instanceof ValidationError ||
//       error instanceof NotFoundError ||
//       error instanceof ForbiddenError
//     )
//       return NextResponse.json(
//         { error: error.message },
//         { status: error.statusCode }
//       );
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
