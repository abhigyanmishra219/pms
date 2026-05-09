import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: false,
    message: "This endpoint is deprecated. Use fingerprint login instead."
  }, { status: 410 });
}