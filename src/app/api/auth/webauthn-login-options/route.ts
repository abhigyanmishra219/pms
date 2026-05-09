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
      select: { credentialId: true, name: true }
    });

    if (allStaff.length === 0) {
      return NextResponse.json({ error: "No fingerprint registered yet" }, { status: 400 });
    }

    const challenge = crypto.randomBytes(32).toString("base64url");

    await prismaclient.staff.updateMany({
      where: { credentialId: { not: null } },
      data: { setupToken: `login:${challenge}` }
    });

    return NextResponse.json({
      challenge,
      rpId: process.env.NEXT_PUBLIC_RP_ID,
      timeout: 60000,
      userVerification: "required",
      allowCredentials: allStaff.map((staff) => ({
        type: "public-key",
        id: staff.credentialId,        // Send as string (simplest & most reliable)
        transports: ["internal", "hybrid"]
      }))
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}