import { createToken } from "@/lib/jwt";
import prismaclient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const user = await prismaclient.user.findFirst({
            where: {
                email: body.email,
                password: body.password
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid credentials"
            });
        }

        if (!user.id) {
            return NextResponse.json({
                success: false,
                message: "User ID not found"
            });
        }

        const token = createToken(user.id);

        const res = NextResponse.json({
            success: true,
            user
        });

        res.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
        });

        return res;

    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: "Server Error"
        });
    }
}