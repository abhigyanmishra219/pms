"use client";

import { redirect } from "next/navigation";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    redirect("/login")
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
