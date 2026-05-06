import prismaclient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";  // ← add this import

export async function POST(request: NextRequest) {
  const body = await request.json();

  const setupToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const Member = {
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    setupToken,
    tokenExpiry,
    isActive: false,
  };

  try {
    const member = await prismaclient.staff.create({
      data: Member,
    });

    return NextResponse.json({
      success: true,
      user: member,
      setupToken,
    });

  } catch (error: unknown) {
    
    // ↓ this block is new
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({
          success: false,
          message: "This email is already registered"
        })
      }
    }

    console.error("Prisma error:", error)
    return NextResponse.json({
      success: false,
      message: "Something went wrong"
    })
  }
}