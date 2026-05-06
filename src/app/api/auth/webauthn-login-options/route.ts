import { NextRequest, NextResponse } from "next/server"
import prismaclient from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Saare active staff lo jinke paas fingerprint registered hai
    const allStaff = await prismaclient.staff.findMany({
      where: {
        isActive: true,
        credentialId: { not: null }
      }
    })

    if (allStaff.length === 0) {
      return NextResponse.json(
        { error: "No registered staff found" },
        { status: 400 }
      )
    }

    const challenge = crypto.randomBytes(32).toString("base64url")

    // Challenge ko DB mein temporarily store karo
    // Hum pehle staff ke record mein store karte hain
    // (verify pe match karenge)
    await prismaclient.staff.updateMany({
      where: {
        isActive: true,
        credentialId: { not: null }
      },
      data: {
        setupToken: `login::${challenge}`
      }
    })

    return NextResponse.json({
      challenge,
      timeout: 60000,
      rpId: process.env.NEXT_PUBLIC_RP_ID || "localhost",
      userVerification: "required",
      // Saare registered staff ke credentials bhejo
      // Browser automatically sahi wala match karega
      allowCredentials: allStaff.map(s => ({
        type: "public-key",
        id: s.credentialId,
        transports: ["internal"]
      }))
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}