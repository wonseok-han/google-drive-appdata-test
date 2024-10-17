import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

export async function POST(req: NextRequest) {
  const { fileName } = await req.json();

  // 쿠키에서 액세스 토큰 가져오기
  const accessToken = req.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token not found" },
      { status: 401 }
    );
  }

  // OAuth2 클라이언트에 액세스 토큰 설정
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    // Google Drive에서 파일명으로 파일 ID 검색
    const listResponse = await drive.files.list({
      q: `name contains '${fileName}'`,
      spaces: "appDataFolder",
      fields: "files(id, name, createdTime)",
    });

    const files = listResponse.data.files || [];
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error searching files on Drive:", error);
    return NextResponse.json(
      { error: "Failed to search files" },
      { status: 500 }
    );
  }
}
