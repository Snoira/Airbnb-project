"use client";
import { useRouter } from "next/navigation";

type Props = {
  isAuth: boolean;
  deleteHandler: () => Promise<void>;
};
export function AuthNav({ isAuth, deleteHandler }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await deleteHandler();
    router.refresh()
  };

  const handleLogin = () => {
    router.push("/signIn");
  };

  return (
    <>
      {isAuth ? (
        <button onClick={handleLogout}>Log out</button>
      ) : (
        <button onClick={handleLogin}>Sign in</button>
      )}
    </>
  );
}
