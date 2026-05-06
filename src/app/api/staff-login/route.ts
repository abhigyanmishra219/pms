import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name || String(name).trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    // Check 1: Find active staff by name (case-insensitive)
    const staff = await prisma.staff.findFirst({
      where: {
        name: {
          equals: String(name).trim(),
          mode: "insensitive",
        },
        isActive: true, // sirf active staff login kar sake
      },
      select: {
        id: true,
        name: true,
        role: true,
        credentialId: true, // fingerprint registered hai?
        publicKey: true,    // fingerprint key hai?
      },
    });

    // Check 1 fail: name nahi mila ya inactive hai
    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff member not found or account is inactive" },
        { status: 404 }
      );
    }

    // Check 2: credentialId aur publicKey dono null nahi hone chahiye
    if (!staff.credentialId || !staff.publicKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Fingerprint not registered. Please contact admin.",
        },
        { status: 403 }
      );
    }

    // ✅ Dono checks pass — login allow karo
    return NextResponse.json(
      {
        success: true,
        message: "Verified successfully",
        staff: {
          id: staff.id,
          name: staff.name,
          role: staff.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[STAFF_LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}