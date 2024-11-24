import * as Jose from "jose";
import { cookies } from 'next/headers'

//bryt ut?
type JWTUserPayload = {
    userId: string;
    [key: string]: any;
}

const secret: string | undefined = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET environment variable is not set");

const encodedSecret = new TextEncoder().encode(secret);

//vad är det egentligen jag enkrypterar???
// user payload innehåller user ID -> enkrypteras i encryptUser
// som genom SignJWT med tillhörande metoder och algoritmer och secerets skapar en "token"/"session??"(också: SKILLNAD PÅ DESSA??)
// alltså det inkryperade user IDt? måste kunna innehålla annat då? som roles etc?
export async function encrypt(payload: JWTUserPayload): Promise<string> {
    try {
        return await new Jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('5h')
            .sign(encodedSecret);

    } catch (error) {
        console.error("Error signing JWT:", error);
        throw new Error("Failed to sign JWT");
    }
}

export async function decrypt(token: string): Promise<JWTUserPayload | null> {
    try {
        const { payload } = await Jose.jwtVerify(token, encodedSecret)
        return payload as JWTUserPayload 
        
    } catch (error:any) {
        if (error instanceof Jose.errors.JWTExpired) {
            // await deleteSession()
            //implementera funktionalitet som varnar och frågar om ny token ska göras?
            console.error('JWT is invalid:', error.code)
        } else if (error instanceof Jose.errors.JWTInvalid) {
            console.error('JWT is invalid:', error.code)
        } else {
            console.error('JWT verification failed:', error.code)
        }

        return null
    }
}

export async function createSession(userId: string): Promise<undefined> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionData: JWTUserPayload = { userId, expiresAt };
  const encryptedSession = await encrypt(sessionData); // Kryptera sessionData- bättre att kalla token?

  const cookieStore = cookies(); // Hämta cookieStore
  cookieStore.set('session', encryptedSession, 
//     {
//     httpOnly: true,
//     secure: true,
//     expires: expiresAt,
//     sameSite: 'lax',
//     path: '/',
//     // domain: 'localhost'
//     domain: undefined
//   }
);
}

export async function deleteSession(): Promise <undefined> {
    const cookieStore = cookies()
    cookieStore.delete('session')
  }