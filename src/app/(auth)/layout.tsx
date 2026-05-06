import UserProvider from "@/components/context/user-context";
import { getUserFromCookies } from "@/lib/helper";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      {children}
    </UserProvider>
  );
}