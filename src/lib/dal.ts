import { cookies } from 'next/headers'
import { decrypt } from '@/utils/jwt'
import { cache } from 'react';
import { getUser } from '@/actions/users';
import { SafeUser } from '@/types/user';

//onödigt att lagra i cache? potentiellt bättre att lagra userInfo
export const verifySession = cache(async (): Promise<SessionObj> => {
    const cookieStore = cookies();
    const cookie = cookieStore.get('session')?.value

    if (!cookie) {
        return { isAuth: false, userId: null };
        // redirect('/')
    }

    const session = await decrypt(cookie)
    console.log("DAL SESSION: ", session)

    if (!session?.userId) {
        console.log("RETURN NULL DAL")
        return { isAuth: false, userId: null };
        //   redirect('/login')
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