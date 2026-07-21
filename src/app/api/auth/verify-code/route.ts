import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/auth/verificationStore";
import { toStoredPhone } from "@/lib/utils/phone";

interface VerifyCodeRequest {
  email?: string;
  phone?: string;
  code: string;
}

export async function POST(req: NextRequest) {
  let body: VerifyCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, phone, code } = body;
  const identifier = phone ? toStoredPhone(phone) : email;
  if (!identifier || !code) {
    return NextResponse.json({ error: "email or phone, and code, are required" }, { status: 400 });
  }

  const valid = verifyCode(identifier, code);
  return NextResponse.json({ valid });
}
