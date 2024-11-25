import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/utils/jwt"
import { cookies } from "next/headers"

const protectedRoutes = [
  "/dashboard",
  "/api/users/me",
  "/api/listings",
  "/api/listings/:id*",
  "/api/bookngs/:id*"
]
// const publicRoutes = ["/", "/api/auth/login", "/api/auth/register"]
const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"]

export default async function middleware(request: NextRequest) {

  console.log("--------------MIDDLEWARE--------------")
  const path = request.nextUrl.pathname
  const method = request.method
  const userParam = request.nextUrl.searchParams.get("user")

  
  console.log("PATH: ", path, "METHOD: ", method)

  const isProtectedRoute = protectedRoutes.includes(path)
  // const isPublicRoute = publicRoutes.includes(path)
  const isProtectedMethod = protectedMethods.includes(method)

  if (path === "/api/listings" && !userParam) return NextResponse.next();
  if (isProtectedRoute || isProtectedMethod) {
    try {
      console.warn("--------------PROTECTED--------------")

      //kanske inte optimalt med let men funkar!ß
      let cookie: string | undefined | null = ""

      if (path.includes("/api")) {
        cookie = request.headers.get('cookie'); // Debug headers
        if (cookie) console.log('--got cookie from header--');
      } else {
        const cookieStore = cookies()
        cookie = cookieStore.get("session")?.value
        if (cookie) console.log('--got cookie from cookiestore--');
      }

      if (!cookie) return NextResponse.redirect(new URL('/', request.nextUrl))
      const sessionData = await decrypt(cookie)

      if (!sessionData?.userId) return NextResponse.redirect(new URL('/', request.nextUrl))

      const headers = new Headers(request.headers)
      headers.set("userId", sessionData.userId)

      console.log("_________________________")

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

  console.log("--------------SAFE--------------")

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/api/users/me",
    "/api/listings",
    "/api/listings/:id*",
    "/api/bookngs/:id*",
  ],
}