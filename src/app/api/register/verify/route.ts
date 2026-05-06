import { NextRequest, NextResponse } from "next/server"
import prismaclient from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.json({ valid: false, error: "No token" })

  const staff = await prismaclient.staff.findFirst({ where: { setupToken: token } })

  if (!staff)
    return NextResponse.json({ valid: false, error: "Invalid link" })
  if (!staff.tokenExpiry || staff.tokenExpiry < new Date())
    return NextResponse.json({ valid: false, error: "This link has expired" })
  if (staff.credentialId)
    return NextResponse.json({ valid: false, error: "Fingerprint already registered" })

  return NextResponse.json({ valid: true, name: staff.name })
}