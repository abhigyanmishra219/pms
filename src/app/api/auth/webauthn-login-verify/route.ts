// src/app/api/auth/webauthn-login-verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismaclient from "@/lib/prisma";
import { createToken } from "@/lib/jwt";
import { verifyWebAuthnLogin } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  try {
    const { credentialId, authenticatorData, clientDataJSON, signature } = await req.json();

    const staff = await prismaclient.staff.findFirst({
      where: { credentialId }
    });

    if (!staff || !staff.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const expectedChallenge = staff.setupToken?.replace("login-challenge:", "");

    if (!expectedChallenge) {
      return NextResponse.json({ error: "Session expired. Try again." }, { status: 401 });
    }

    const isValid = await verifyWebAuthnLogin(
      { id: credentialId, rawId: credentialId, response: { authenticatorData, clientDataJSON, signature }, type: "public-key" },
      expectedChallenge,
      process.env.NEXT_PUBLIC_RP_ID || "localhost"
    );

    if (!isValid) {
      return NextResponse.json({ error: "Fingerprint verification failed" }, { status: 401 });
    }

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

    await prismaclient.staff.update({
      where: { id: staff.id },
      data: { setupToken: null }
    });

    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}