"use server"
import { cookies } from 'next/headers'
import { decrypt } from '@/utils/jwt'
import { cache } from 'react';
import { getUser } from '@/actions/users';
import { SafeUser } from '@/types/user';

export const verifySession = cache(async (): Promise<SessionObj> => {
    const cookieStore = cookies();
    const cookie = cookieStore.get('session')?.value

    if (!cookie) {
        return { isAuth: false, userId: null };
    }

    const session = await decrypt(cookie)

    if (!session?.userId) {
        return { isAuth: false, userId: null };
    }

    return { isAuth: true, userId: session.userId }
});

export const getSafeUser = cache(async (): Promise<SafeUser | null> => {
    const session = await verifySession()
    if (!session.userId) return null

    try {
        const safeUser = await getUser()
        return safeUser

    } catch (error) {
        console.log('Failed to fetch user')
        return null
    }
})

//kanske onödigt med cache här om den inte också hjälper till att hämta cookien från cachen?
export const getCookie = cache(async (): Promise<string | null> => {

    const cookieStore = cookies();
    const cookie = cookieStore.get('session')?.value

    if (cookie) return cookie

    return null
})

export const deleteCookie = cache(async () => {
    
    const cookieStore = cookies();
    cookieStore.delete('session')

})