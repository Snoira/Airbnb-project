"use client";
import { RegisterForm } from "./RegisterForm";
import { LoginForm } from "./LoginForm";
import { Button } from "./ui/button";
import { useState } from "react";

export function SignInCard() {
  const [hasAccount, setHasAccount] = useState<boolean>(true);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">
        {hasAccount ? "Welcome back!" : "Create a new account"}
      </h2>
      {hasAccount ? <LoginForm /> : <RegisterForm />}
      <p className="text-sm text-center">
        {hasAccount ? "Don't have an account? " : "Already have an account? "}
        <Button variant="link" onClick={() => setHasAccount(!hasAccount)}>
          {hasAccount ? "Register" : "Login"}
        </Button>
      </p>
    </div>
  );
}
