import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    const data = await apiRequest<{
      message: string;
      accessToken: string;
      refreshToken: string;
    }>("/auth/reset-password", { method: "POST", body: { token, password } });

    // Auto-login after successful reset
    const store = await cookies();
    store.set("access_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
      sameSite: "lax",
    });
    store.set("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return NextResponse.json({ message: data.message });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al restablecer";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
