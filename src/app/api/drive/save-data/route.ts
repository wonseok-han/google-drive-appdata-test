import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

export async function POST(req: NextRequest) {
  const { key, fileName } = await req.json();

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
    // 기존 파일이 존재하는지 확인
    const listResponse = await drive.files.list({
      q: `name='${fileName}' and parents in 'appDataFolder'`,
      spaces: "appDataFolder",
      fields: "files(id)",
    });

    const files = listResponse.data.files;
    if (files && files.length > 0) {
      // 파일이 이미 존재하면 해당 파일을 덮어쓰기
      const fileId = files[0].id;

      if (!fileId) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
      }

      drive.files.update({
        fileId: fileId,
        media: media,
        requestBody: {
          name: "user-key.json",
        },
      });
    } else {
      // 파일이 존재하지 않으면 새로 생성
      await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving key to Drive:", error);
    return NextResponse.json({ error: "Failed to save key" }, { status: 500 });
  }
}
