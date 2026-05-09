"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setemail] = useState<string>("");
  const [password, setpassword] = useState<string>("");

  async function handlesubmit() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Login Successful!");
      router.push("/");
    } else {
      toast.error(data.message || "Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => setemail(e.target.value)}
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handlesubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Login as Manager
          </Button>

          {/* Staff Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Are you a Staff Member?</p>
            <Link href="/staff-login">
              <Button 
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                🔐 Login with Fingerprint
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}