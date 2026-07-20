import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/auth/verificationStore";

interface VerifyCodeRequest {
  email: string;
  code: string;
}

export async function POST(req: NextRequest) {
  let body: VerifyCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, code } = body;
  if (!email || !code) {
    return NextResponse.json({ error: "email and code are required" }, { status: 400 });
  }

  const valid = verifyCode(email, code);
  return NextResponse.json({ valid });
}
