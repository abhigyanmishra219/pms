import { NextRequest, NextResponse } from "next/server";
import prismaclient from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const staffList = await prismaclient.staff.findMany({
      where: { 
        isActive: true, 
        credentialId: { not: null } 
      },
      select: { credentialId: true }
    });

    if (staffList.length === 0) {
      return NextResponse.json({ error: "No registered fingerprints found" }, { status: 400 });
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
      allowCredentials: staffList.map(s => ({
        type: "public-key",
        id: s.credentialId,
        transports: ["internal", "hybrid"]
      }))
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}