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

    console.log("Found staff:", allStaff.map(s => ({ name: s.name, credentialId: s.credentialId })));

    if (allStaff.length === 0) {
      return NextResponse.json({ error: "No fingerprint registered" }, { status: 400 });
    }

    const challenge = crypto.randomBytes(32).toString("base64url");

    await prismaclient.staff.updateMany({
      where: { credentialId: { not: null } },
      data: { setupToken: `login:${challenge}` }
    });

    // Safe conversion with fallback
    const allowCredentials = allStaff
      .map((staff) => {
        try {
          let base64 = staff.credentialId || "";
          base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) base64 += '=';

          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          return {
            type: "public-key" as const,
            id: bytes,
            transports: ["internal", "hybrid"] as const,
          };
        } catch (e) {
          console.error(`Invalid credentialId for ${staff.name}:`, staff.credentialId);
          return null;
        }
      })
      .filter(Boolean);

    if (allowCredentials.length === 0) {
      return NextResponse.json({ error: "No valid fingerprint found" }, { status: 400 });
    }

    return NextResponse.json({
      challenge,
      rpId: process.env.NEXT_PUBLIC_RP_ID,
      timeout: 60000,
      userVerification: "required",
      allowCredentials
    });

  } catch (err: any) {
    console.error("Critical Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}