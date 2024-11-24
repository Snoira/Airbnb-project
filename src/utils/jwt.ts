import * as Jose from "jose";

const secret: string | undefined = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET environment variable is not set");

const encodedSecret = new TextEncoder().encode(secret);

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

