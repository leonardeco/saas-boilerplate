"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "./api";

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get("access_token")?.value;
}

export async function requireAuth() {
  const token = await getAccessToken();
  if (!token) redirect("/login");
  return token;
}

export async function login(email: string, password: string) {
  const data = await apiRequest<{ accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  const store = await cookies();
  store.set("access_token", data.accessToken, { httpOnly: true, path: "/", maxAge: 60 * 15 });
  store.set("refresh_token", data.refreshToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });

  return data;
}

export async function register(name: string, email: string, password: string) {
  const data = await apiRequest<{ accessToken: string; refreshToken: string }>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

  const store = await cookies();
  store.set("access_token", data.accessToken, { httpOnly: true, path: "/", maxAge: 60 * 15 });
  store.set("refresh_token", data.refreshToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });

  return data;
}

export async function logout() {
  const store = await cookies();
  store.delete("access_token");
  store.delete("refresh_token");
  redirect("/login");
}
