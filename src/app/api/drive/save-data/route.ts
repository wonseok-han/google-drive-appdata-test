import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

export async function POST(req: NextRequest) {
  const { key } = await req.json();

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

  const fileMetadata = {
    name: "user-key.json",
    parents: ["appDataFolder"],
  };

  const media = {
    mimeType: "application/json",
    body: JSON.stringify({ key }),
  };

  try {
    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving key to Drive:", error);
    return NextResponse.json({ error: "Failed to save key" }, { status: 500 });
  }
}
