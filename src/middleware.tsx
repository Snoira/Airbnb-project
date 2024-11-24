import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/utils/jwt"
import { cookies } from "next/headers"

const protectedRoutes = [
  // "/dashboard",
  "/api/users/me",
  "/api/listings/:id*",
  "/api/bookngs/:id*"
]
const publicRoutes = ["/", "/api/auth/login", "/api/auth/register"]
const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"]

export default async function middleware(request: NextRequest) {

  console.log("--------------MIDDLEWARE--------------")
  const path = request.nextUrl.pathname
  const method = request.method
  console.log("PATH: ", path, "METHOD: ", method)

  const isProtectedRoute = protectedRoutes.includes(path)
  // const isPublicRoute = publicRoutes.includes(path)
  const isProtectedMethod = protectedMethods.includes(method)

  if (isProtectedRoute || isProtectedMethod) {
    try {
      console.warn("--------------PROTECTED--------------")

      const Authorization = request.headers.get("Authorization");

      if (!Authorization) {
        throw new Error("No authrization header");
      }
      const token = Authorization.split(" ")?.[1] || null;
      if (!token) {
        throw new Error("No token");
      }
  
      const sessionData = await decrypt(token)

      if (!sessionData?.userId) return NextResponse.redirect(new URL('/', request.nextUrl))

      const headers = new Headers(request.headers)
      headers.set("userId", sessionData.userId)

      console.log("______________________________")

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
    // "/dashboard",
    "/api/users/me",
    "/api/listings",
    "/api/listings/:id*",
    "/api/bookngs/:id*",
  ],
}