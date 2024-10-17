import { NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization failed" },
      { status: 400 }
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 세션이나 데이터베이스에 저장 가능
    // 여기서는 예시로 액세스 토큰을 로그로 출력
    // console.log(tokens);

    // return NextResponse.redirect(
    //   new URL("/", process.env.NEXT_PUBLIC_BASE_URL)
    // );

    // 토큰을 쿠키에 저장
    const response = NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL)
    );

    // HTTP-only, Secure 쿠키 설정
    response.cookies.set("access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600, // 1시간 동안 유효
    });

    return response;
  } catch (error) {
    console.error("Error getting tokens:", error);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
}
