import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const data = await apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
  return NextResponse.json(data);
}
