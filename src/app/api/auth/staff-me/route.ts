// src/app/api/auth/staff-me/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismaclient from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("staff-token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token" });
    }

    const decoded = verifyToken(token);

    // Type guard
    if (!decoded || typeof decoded === "string" || !decoded.id) {
      return NextResponse.json({ success: false, message: "Invalid token" });
    }

    const staff = await prismaclient.staff.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json({ success: false, message: "Staff not found or inactive" });
    }

    return NextResponse.json({
      success: true,
      staff,
    });
  } catch (err: any) {
    console.error("Staff-me error:", err);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}