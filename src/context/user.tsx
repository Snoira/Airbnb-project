"use client";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState
} from "react";
import { 
    SafeUser, 
    UserLoginData, 
    UserRegistrationData 
} from "@/types/user";
import {
    login as loginAction,
    register as registerAction
} from "@/actions/auth"
import { getUser as getUserAction } from "@/actions/users"
import LocalStorageKit from "@/utils/localStorageKit";

type OnComplete = (response?: any) => void;
type OnError = (error?: any) => void;

// default state
type UserContextState = {
    token: string | null;
    user: SafeUser | null;
    actions: {
        login: (
            // formData: UserLoginData,
            email: string,
            password: string,
            onComplete: OnComplete,
            onError: OnError
        ) => Promise<void>;
        logout: () => void;
        register: (
            formData: UserRegistrationData,
            onComplete: OnComplete,
            onError: OnError
        ) => Promise<void>;
    };
};

const defaultState: UserContextState = {
    token: null,
    user: null,
    actions: {
        login: () => Promise.resolve(),
        logout: () => { },
        register: () => Promise.resolve()
    },
};

// context initator constructor
const UserContext = createContext<Partial<UserContextState>>(defaultState);

// provider
function UserProvider({ children }: PropsWithChildren) {
    const [token, setToken] = useState<typeof defaultState.token>(
        defaultState.token
    );
    const [user, setUser] = useState<typeof defaultState.user>(defaultState.user);

    useEffect(() => {
        if (!token) {
            let _token = LocalStorageKit.get("@library/token")
            if (_token) {
                setToken(_token)
                return
            }
        }
    }, [])

    useEffect(() => {
        if (token && !user) {
            getUser()
        }
    }, [token])

    const login: typeof defaultState.actions.login = async (
        // formData,
        email,
        password,
        onComplete,
        onError
    ) => {
        try {
            const token = await loginAction(email, password)
            setToken(token)
            LocalStorageKit.set("@library/token", token)
        } catch (error: any) {
            console.warn("Error logging in", error.message)
            onError()
        }
    };

    const logout = () => {
        setUser(defaultState.user)
        setToken(defaultState.token)
        LocalStorageKit.remove("@library/token")
    };

    const register: typeof defaultState.actions.register = async (
        formData,
        onComplete,
        onError
    ) => {
        try {
            const token = await registerAction(formData)
            setToken(token)
            console.log(token)
            LocalStorageKit.set("@library/token", token)
        } catch (error: any) {
            console.warn("Error register user", error.message)
            onError()
        }
    };

    const getUser = async () => {
        try {
            if (!token) {
                throw new Error();
            }
            console.log("GET USER")
            const _user = await getUserAction(token)
            console.log(_user)
            setUser(_user)
        } catch (error: any) {
            console.log(error)
            logout();
        }
    }

    return (
        <UserContext.Provider
            value={{
                token,
                user,
                actions: {
                    login,
                    logout,
                    register
                },
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

// use hook
function useUser() {
    const user = useContext(UserContext);
    if (!user) {
        throw new Error("'useUser' used outside of provider");
    }
    return user as UserContextState;
}

export { UserProvider, useUser };