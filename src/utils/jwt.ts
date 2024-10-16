import * as Jose from "jose";

//bryt ut?
type JWTUserPayload = {
    userId: string;
    [key: string]: any;
}

const secret: string | undefined = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
}

const encodedSecret = new TextEncoder().encode(secret);

export async function signJWT(payload: JWTUserPayload): Promise<string> {
    try { 
        return await new Jose.SignJWT(payload)//vid tillfälle kolla om bäst praxis att ha kvar await eller ta bort
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('5h')
            .sign(encodedSecret);

    } catch (error) {
        console.error("Error signing JWT:", error);
        throw new Error("Failed to sign JWT");
    }
}

export async function verifyJWT(token: string): Promise<JWTUserPayload | null> {
    try {
        const { payload } = await Jose.jwtVerify(token, encodedSecret)
        
        //lägg till validering av payload så att den innehåller de nödvändiga fälten?

        return payload as JWTUserPayload

    } catch (error) {
        //implementera redirect?
        if (error instanceof Jose.errors.JWTExpired) {
            console.error('JWT has expired:', error)
        } else if (error instanceof Jose.errors.JWTInvalid) {
            console.error('JWT is invalid:', error)
        } else {
            console.error('JWT verification failed:', error)
        }
        
        return null
    }
}