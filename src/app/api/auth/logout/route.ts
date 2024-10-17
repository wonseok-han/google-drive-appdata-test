import { NextResponse } from "next/server";

export async function POST() {
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
  const response = NextResponse.redirect(redirectUrl);

  // 쿠키 만료시켜서 삭제
  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // 즉시 만료
  });

  return response;
}
