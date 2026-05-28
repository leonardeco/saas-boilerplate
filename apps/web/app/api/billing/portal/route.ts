import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

export async function POST(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = await req.json();
  const data = await apiRequest<{ url: string }>("/billing/portal", {
    method: "POST",
    token,
    body: { organizationId },
  });

  return NextResponse.json(data);
}
