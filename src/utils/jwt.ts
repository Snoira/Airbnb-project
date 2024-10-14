import * as Jose from "jose";

type JWTUserPayload = {
    userId: string;
    [key: string]: any;
}

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
}

const encodedSecret = new TextEncoder().encode(secret);

export async function signJWT(payload:JWTUserPayload): Promise<string> {
    return await new Jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5h')
    .sign(encodedSecret);
}