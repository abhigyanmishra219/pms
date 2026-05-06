import { createToken } from "@/lib/jwt";
import prismaclient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    const user = await prismaclient.user.findUnique({
        where: {
            email: body.email,
            password: body.password
        }
    })

    if (user?.password == body?.password) {
        const userToken: { id: string | undefined } = { id: user?.id }
        const token = createToken(userToken)
        const res = NextResponse.json({
            success: true,
            user: user
        })

        // ← sirf yahan change hai
        res.cookies.set('token', token, {
            httpOnly: true,
            sameSite: "lax",   // strict se lax kiya
            secure: false,     // HTTP pe kaam kare
            path: "/",
        })

        return res
    }

    return NextResponse.json({
        success: false
    })
}