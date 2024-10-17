import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
);

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token not found" },
      { status: 401 }
    );
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    // 삭제할 파일 이름을 요청에서 가져옴
    const { fileName } = await req.json();
    if (!fileName) {
      return NextResponse.json(
        { error: "No file name provided" },
        { status: 400 }
      );
    }

    // Google Drive에서 파일명으로 파일 ID 검색
    const listResponse = await drive.files.list({
      q: `name='${fileName}' and parents in 'appDataFolder'`,
      spaces: "appDataFolder",
      fields: "files(id, name)",
    });

    const files = listResponse.data.files;
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 파일명을 기반으로 검색된 모든 파일 삭제
    for (const file of files) {
      const fileId = file.id;

      if (!fileId) {
        return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
      }

      await drive.files.delete({ fileId });
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
