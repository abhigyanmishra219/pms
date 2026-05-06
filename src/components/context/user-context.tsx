"use client"


import { RoleType } from "@prisma/client"
import { createContext, ReactNode } from "react"

type userwithoutpassword={
    name:string,
    email:string,
    role:RoleType
}|null
export const UserContext=createContext<{user : userwithoutpassword}>({user:null})
export default function UserProvider({
    children,
    user
}:{children:ReactNode,user:userwithoutpassword})
{
    return(
        <>
          <UserContext.Provider value={{
            user
          }}>
            {children}
          </UserContext.Provider>
        </>
    )
}