"use client";

import Admin from "@/components/admin";
import { UserContext } from "@/components/context/user-context";
import { useContext } from "react";

export default function Home() {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Admin / Manager Dashboard
  if (user.role === "manager") {
    return <Admin />;
  }

  // Staff or other roles
  return (
    <div className="p-8">
      <h1>Welcome, {user.name}</h1>
      <p>Your role: {user.role}</p>
    </div>
  );
}