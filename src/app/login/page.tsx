"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function Login() {
  const router=useRouter()
    const [email, setemail] = useState<string>("")
    const [password, setpassword] = useState<string>("")
    async function handlesubmit() {
        const res=await fetch("/api/login",{
            method:"POST",
            body:JSON.stringify({
                email,
                password
            }),
        });
        const data=await res.json()
        if(data.success)
        {
            toast("Login Done")
            router.push("/")
        }
        else{
            toast("something went wrong")
        }
    }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e)=>setemail(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" 
                type="password"
                value={password}
                onChange={(e)=>setpassword(e.target.value)} 
                required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={handlesubmit} className="w-full bg-blue-600 hover:bg-blue-900">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
