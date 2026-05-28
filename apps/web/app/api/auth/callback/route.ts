import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Called by the API after a successful OAuth flow.
 * Sets httpOnly cookies and redirects to dashboard.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url));
  }

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  const store = await cookies();
  store.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15, // 15 min
    sameSite: "lax",
  });
  store.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
