// src/app/api/auth/webauthn-login-options/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismaclient from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const allStaff = await prismaclient.staff.findMany({
      where: {
        isActive: true,
        credentialId: { not: null }
      },
      select: { credentialId: true }
    });

    if (allStaff.length === 0) {
      return NextResponse.json({ error: "No staff with registered fingerprint" }, { status: 400 });
    }

    const challenge = crypto.randomBytes(32).toString("base64url");

    await prismaclient.staff.updateMany({
      where: { credentialId: { not: null } },
      data: { setupToken: `login-challenge:${challenge}` }
    });

    return NextResponse.json({
      challenge,
      timeout: 60000,
      rpId: process.env.NEXT_PUBLIC_RP_ID,
      userVerification: "required",
      allowCredentials: allStaff.map((staff) => ({
        type: "public-key",
        id: Uint8Array.from(atob(staff.credentialId!), (c) => c.charCodeAt(0)),
        transports: ["internal", "hybrid"] as const,
      }))
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}