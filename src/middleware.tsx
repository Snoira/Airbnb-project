import { NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/utils/jwt"

const UNSAFE_METHODS = ["POST", "PUT", "PATCH", "DELETE"]

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  console.log("middleware", url.pathname)

  if (UNSAFE_METHODS.includes(request.method)) {
    try {
      console.log("not safe path")

      const Authorization = request.headers.get("Authorization")
      if (!Authorization) {
        //inkonsekvent errorhantering på olika sidors
        //reserch, jämför olika sätt, pros cons
        throw new Error("No authrization header")
        //implementer redirect i errorhantering?
        // return NextResponse.redirect(new URL('/login', request.url))
      }

      const token = Authorization.split(" ")?.[1] || null
      if (!token) {
        throw new Error("No token")
      }
      console.log("Authorization -> token", token)

      const decryptedToken = await verifyJWT(token)
      if (!decryptedToken) {
        throw new Error("No token payload")
      }

      const headers = new Headers(request.headers)
      headers.set("userId", decryptedToken.userId)

      return NextResponse.next(
        { headers }
      )

    } catch (error: any) {
      console.log("Error validating token: ", error.message)

      return NextResponse.json(
        { message: "Unauthenticated" },
        { status: 401 }
      )
    }
  }
}

export const config = {
  matcher: [
    "/api/listings/"
  ],
}