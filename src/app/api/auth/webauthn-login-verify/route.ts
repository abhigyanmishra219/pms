import { NextRequest, NextResponse } from "next/server"
import prismaclient from "@/lib/prisma"
import { createToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const { credentialId } = await req.json()

    // credentialId se staff dhundo
    const staff = await prismaclient.staff.findFirst({
      where: { credentialId }
    })

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 401 }
      )
    }

    if (!staff.isActive) {
      return NextResponse.json(
        { error: "Account not active" },
        { status: 401 }
      )
    }

    // JWT token banao
    const token = createToken(staff.id )

    const res = NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    })

    // Cookie set karo
    res.cookies.set("staff-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    })

    return res

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}