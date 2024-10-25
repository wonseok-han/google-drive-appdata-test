"use client";

import { useEffect, useState } from "react";

export default function ClientSideCallback() {
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("확인");

    const fetchAccessToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      const codeVerifier = sessionStorage.getItem("code_verifier");
      if (!codeVerifier) {
        setError("Code verifier not found.");
        return;
      }

      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID; // 환경 변수에서 클라이언트 ID를 가져옵니다.
        const redirectUri = "http://localhost:3000/auth/callback";

        if (!clientId) return;
        if (!code) throw new Error("Authorization code is missing.");

        console.log(clientId);

        // 구글 토큰 요청
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }).toString(),
        });

        const data = await response.json();
        console.log("Access Token:", data.access_token);
        // 여기서 토큰을 저장하고 API 호출에 사용
      } catch (err) {
        console.error("Error fetching access token:", err);
        setError("Failed to fetch access token.");
      }
    };

    fetchAccessToken();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Authenticating...</div>;
}
