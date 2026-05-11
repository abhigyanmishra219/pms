// src/app/api/auth/staff-me/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    message: "Staff me endpoint disabled" 
  });
}