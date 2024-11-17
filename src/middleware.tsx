// import { NextRequest, NextResponse } from "next/server"
// import { decrypt } from "@/utils/jwt"

// const UNSAFE_METHODS = ["POST", "PUT", "PATCH", "DELETE"]

// export async function middleware(request: NextRequest) {
//   const url = new URL(request.url)
//   console.log("middleware", url.pathname)

//   if (UNSAFE_METHODS.includes(request.method)) {
//     try {
//       console.log("not safe path")

//       const Authorization = request.headers.get("Authorization")
//       if (!Authorization) {
//         //inkonsekvent errorhantering på olika sidors
//         //reserch, jämför olika sätt, pros cons
//         throw new Error("No authrization header")
//         //implementer redirect i errorhantering?
//         // return NextResponse.redirect(new URL('/login', request.url))
//       }

//       // const token = Authorization.split(" ")?.[1] || null
//       // if (!token) {
//       //   throw new Error("No token")
//       // }
//       // console.log("Authorization -> token", token)

//       const decryptedToken = await decrypt(Authorization)
//       if (!decryptedToken) {
//         throw new Error("No token payload")
//       }

//       const headers = new Headers(request.headers)
//       headers.set("userId", decryptedToken.userId)

//       return NextResponse.next(
//         { headers }
//       )

//     } catch (error: any) {
//       // console.log("Error validating token: ", error.message)

//       return NextResponse.json(
//         { message: "Unauthenticated" },
//         { status: 401 }
//       )
//     }
//   }
//   console.log("Safe");
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/api/listings/",
//     "/api/listings/:id*",
//     "/api/bookngs/:id*"
//   ],
// }

import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/utils/jwt"
import { cookies } from "next/headers"

const protectedRoutes = ["/dashboard"]
const publicRoutes = ["/login", "/register", "/"]

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)


  const cookieStore = cookies()
  const cookie: string | undefined = cookieStore.get("session")?.value
  console.log("COOKIE", cookie) // Cookie hämtas!

  //TYPESCRIPT VAFAN KOMIGEN
  if (!cookie && isProtectedRoute) return NextResponse.redirect(new URL('/', request.nextUrl))

  // const session = await decrypt(cookie ?)

  // if ((isProtectedRoute && !session)) {
  //   return NextResponse.redirect(new URL('/', request.nextUrl))
  // }
}