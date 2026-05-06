import { NextRequest, NextResponse } from "next/server"
import prismaclient from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { token, credentialId, publicKey } = await req.json()

  if (!token || !credentialId || !publicKey)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const staff = await prismaclient.staff.findFirst({
    where: { setupToken: { startsWith: token } }
  })

  if (!staff || !staff.tokenExpiry || staff.tokenExpiry < new Date())
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })

  await prismaclient.staff.update({
    where: { id: staff.id },
    data: {
      credentialId,
      publicKey,
      setupToken: null,
      tokenExpiry: null,
      isActive: true,
    }
  })

  return NextResponse.json({ success: true })
}