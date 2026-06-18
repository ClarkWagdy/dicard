import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(
    new URL("/login", process.env.NEXTAUTH_URL),
  );

  // Clear all next-auth cookies
  res.cookies.delete("next-auth.session-token");
  res.cookies.delete("__Secure-next-auth.session-token");
  res.cookies.delete("next-auth.callback-url");
  res.cookies.delete("next-auth.csrf-token");

  return res;
}
