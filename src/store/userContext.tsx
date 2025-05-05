// "use client";
// import { createContext, useContext, useState } from "react";
// import { SafeUser } from "@/types/user";

// const AuthContext = createContext();

// export function Sidebar() {
//   const [user, setUser] = useState<SafeUser | null>();

//   return (
//     <SidebarContext.Provider value={{ isOpen }}>
//       <SidebarNav />
//     </SidebarContext.Provider>
//   );
// }

// function SidebarNav() {
//   let { isOpen } = useContext(SidebarContext);

//   return (
//     <div>
//       <p>Home</p>

//       {isOpen && <Subnav />}
//     </div>
//   );
// }
