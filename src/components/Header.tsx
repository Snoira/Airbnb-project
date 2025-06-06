import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { checkAuth, deleteSession } from "@/utils/jwt";

export default async function Header() {
  const isAuth = await checkAuth();

  const deleteHandler = async () => {
    "use server";
    await deleteSession();
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-10">
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex text-xl ">
          <Link href="/" className="-m-1.5 p-1.5">
            YAY BNB
          </Link>
        </div>
        <div className="flex gap-x-12">
          <Link
            href="/"
            className="text-sm leading-6 text-stone-900 hover:text-amber-400 hover:underline"
          >
            Home
          </Link>
          <Link
            href="/"
            className="text-sm leading-6 text-stone-900 hover:text-amber-400 hover:underline"
          >
            About
          </Link>
          <Link
            href="/dashboard"
            className="text-sm leading-6 text-stone-900 hover:text-amber-400 hover:underline"
          >
            My Profile
          </Link>
        </div>
        <div className="">
          <AuthNav isAuth={isAuth} deleteHandler={deleteHandler} />
        </div>
      </nav>
    </header>
  );
}
