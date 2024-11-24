import { UserProvider } from "@/context/user";
import { PropsWithChildren } from "react";

export default function Providers({ children }: PropsWithChildren) {
  return <UserProvider>{children}</UserProvider>;
}