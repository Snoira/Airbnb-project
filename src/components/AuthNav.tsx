"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"

type Props = {
  isAuth: boolean,
  deleteHandler: () => {}
}

export function AuthNav({ isAuth, deleteHandler }: Props) {
  const [isLogedin, setIsLogedin] = useState<boolean>(isAuth)
  const [isRegistered, setIsRegistered] = useState<boolean>(isAuth)

  // useEffect(() => {
  //  deleteHandler()
  // }, [isAuth])

  return (
    <>
      {isLogedin ?
        <button
          onClick={() => { deleteHandler(); setIsLogedin(false) }}
        >Log out</button> :
        <div
          className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
          {isRegistered ?
            <LoginForm setIsLogedin={setIsLogedin} /> :
            <RegisterForm setIsLogedin={setIsLogedin} />}

          <button
            onClick={() => setIsRegistered(!isRegistered)}>
            {isRegistered ?
              "Create a new account" :
              "I already have an account"}</button>
        </div>}
    </>
  )

}