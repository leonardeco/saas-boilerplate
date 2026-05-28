import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    await register(name, email, password);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
