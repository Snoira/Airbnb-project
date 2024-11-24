"use client"
import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { useUser } from "@/context/user"


export function Header() {
    const user = useUser()
    const [hasAccount, setHasAccount] = useState<boolean>(false)

    return (
        <div>
            
            {user.user ?
                <button
                    onClick={user.actions.logout}>
                    Log out
                </button> :
                <div 
                className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
                    {
                        hasAccount ?
                            <LoginForm/> :
                            <RegisterForm/>
                    }
                    <button
                    onClick={()=>{
                        setHasAccount(!hasAccount)
                    }}>
                        {hasAccount?
                        "Create a new account": 
                        "I already have an account"}
                    </button>
                </div>
            }

        </div>
    )
}