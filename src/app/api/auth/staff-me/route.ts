import { NextRequest, NextResponse } from "next/server"
import prismaclient from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("staff-token")?.value
    if (!token) return NextResponse.json({ success: false })

    const decoded: any = verifyToken(token)
    if (!decoded) return NextResponse.json({ success: false })

    const staff = await prismaclient.staff.findUnique({
      where: { id: decoded.id }
    })

    if (!staff) return NextResponse.json({ success: false })

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    })
  } catch {
    return NextResponse.json({ success: false })
  }
}