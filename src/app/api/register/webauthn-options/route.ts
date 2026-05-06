import { NextRequest, NextResponse } from "next/server"
import prismaclient from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  const staff = await prismaclient.staff.findFirst({ 
    where: { setupToken: token } 
  })
  
  if (!staff || !staff.tokenExpiry || staff.tokenExpiry < new Date())
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })

  const challenge = crypto.randomBytes(32).toString("base64url")

  // challenge token ke saath store karo
  await prismaclient.staff.update({
    where: { id: staff.id },
    data: { setupToken: `${token}::${challenge}` }
  })

  return NextResponse.json({
    challenge,
    rp: {
      name: "My App",
      id: process.env.NEXT_PUBLIC_RP_ID || "localhost",
    },
    user: {
      id: Buffer.from(staff.id).toString("base64url"),
      name: staff.email,
      displayName: staff.name,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
    },
    timeout: 60000,
    attestation: "none",
  })
}