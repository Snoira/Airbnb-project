import * as Jose from "jose";

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