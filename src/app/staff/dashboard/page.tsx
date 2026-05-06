"use client"
import { UserContext } from "@/components/context/user-context"
import { useContext } from "react"

export default function StaffDashboard(){
    const {user}=useContext(UserContext)
    return(
      
        <>
        <h1>Staff DashBoard</h1>
        <p>Welcome, raj</p>
        </>
    )
}