// src/app/api/auth/webauthn-login-verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismaclient from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { credentialId } = await req.json();

    if (!credentialId) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    const staff = await prismaclient.staff.findFirst({
      where: { credentialId },
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: "Invalid staff account" }, { status: 401 });
    }

    // Create token
    const token = createToken(staff.id);

    const response = NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });

    response.cookies.set("staff-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Clear challenge
    await prismaclient.staff.update({
      where: { id: staff.id },
      data: { setupToken: null },
    });

    return response;

  } catch (err: any) {
    console.error("Verify Error:", err);
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}