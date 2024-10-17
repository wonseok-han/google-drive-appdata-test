import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

// stream을 Buffer로 변환하는 유틸리티 함수
const streamToBuffer = async (readableStream: Readable): Promise<Buffer> => {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

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
      spaces: "appDataFolder",
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      const fileId = response.data.files[0].id;

      if (!fileId) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
      }

      // 파일 다운로드를 위한 스트림 설정
      const file = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );

      // 스트림을 Buffer로 변환
      const fileBuffer = await streamToBuffer(file.data);

      // 파일을 클라이언트로 전송
      const headers = new Headers();
      headers.set("Content-Type", "application/octet-stream");
      headers.set(
        "Content-Disposition",
        'attachment; filename="user-key.json"'
      );

      return new NextResponse(fileBuffer, {
        headers,
      });
    }

    return NextResponse.json({ error: "No file found" }, { status: 404 });
  } catch (error) {
    console.error("Error downloading file from Drive:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
