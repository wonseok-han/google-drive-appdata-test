import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

export async function GET(req: NextRequest) {
  // 쿠키에서 액세스 토큰 가져오기
  const accessToken = req.cookies.get("access_token")?.value;
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");

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
    const response = await drive.files.list({
      q: `name='${fileName}' and parents in 'appDataFolder'`,
      spaces: "appDataFolder", // 추가된 부분
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      const fileId = response.data.files[0].id;

      if (!fileId) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
      }

      const file = await drive.files.get({
        fileId: fileId,
        alt: "media",
      });

      return NextResponse.json(file.data);
    }

    return NextResponse.json({ error: "No key found" }, { status: 404 });
  } catch (error) {
    console.error("Error reading key from Drive:", error);
    return NextResponse.json({ error: "Failed to read key" }, { status: 500 });
  }
}
