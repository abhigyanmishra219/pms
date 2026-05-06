"use client";

import Admin from "@/components/admin";
import { UserContext } from "@/components/context/user-context";
import { useContext } from "react";



export default function Home() {
const {user}=useContext(UserContext)

  return (
    <>
      {user?.role === "manager" && <Admin/> }

      
    </>
  );
}
