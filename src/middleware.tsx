import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/utils/jwt";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard"];
const signInRoute = "/signIn";

export default async function middleware(request: NextRequest) {
  console.log("\n \n \n --------------MIDDLEWARE--------------");

  const path = request.nextUrl.pathname;
  const method = request.method;

  console.log("PATH: ", path, "METHOD: ", method);

  const isProtectedRoute = protectedRoutes.includes(path);
  // const isPublicRoute = publicRoutes.includes(path)

  const cookieStore = cookies();
  const JWT = cookieStore.get("session")?.value;
  console.log("JWT: ", JWT);
  const sessionData = await decrypt(JWT);
  console.log("SESSIONDATA: ", sessionData);
  if (isProtectedRoute) {
    try {
      console.log("\n --------------PROTECTED--------------");

      if (!sessionData?.id)
        return NextResponse.redirect(new URL("/signIn", request.nextUrl));

      console.log("\n");

      return NextResponse.next();
    } catch (error: any) {
      console.log("Error validating token: ", error.message);

      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }
  }

  if (path === signInRoute) {
    if (!!sessionData?.id)
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));

    return NextResponse.next();
  }

  console.log("--------------SAFE--------------");

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
