"use client";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function SignInPage() {
  const [hasAccount, setHasAccount] = useState<boolean>(false);
  const router = useRouter();
  const handleSignIn = () => {
    router.push("/");
  };
  return (
    <div>
      {hasAccount ? <LoginForm /> : <RegisterForm />}
      <button onClick={() => setHasAccount(!hasAccount)}>
        {hasAccount ? "Register" : "Login"}
      </button>
    </div>
  );
}
