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
      return NextResponse.json({ error: "No registered fingerprint found" }, { status: 400 });
    }

    const challenge = crypto.randomBytes(32).toString("base64url");

    // Store challenge for verification
    await prismaclient.staff.updateMany({
      where: { credentialId: { not: null } },
      data: { setupToken: `login:${challenge}` }
    });

    const allowCredentials = allStaff
      .map((staff) => {
        try {
          // Safe base64 to Uint8Array conversion
          let base64 = staff.credentialId!;
          base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) base64 += '=';
          
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          return {
            type: "public-key" as const,
            id: bytes,
            transports: ["internal", "hybrid"] as const,
          };
        } catch (e) {
          console.warn("Skipped invalid credentialId:", staff.credentialId);
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      challenge,
      rpId: process.env.NEXT_PUBLIC_RP_ID,
      timeout: 60000,
      userVerification: "required",
      allowCredentials,
    });

  } catch (err: any) {
    console.error("Options Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}