"use client";

import { generateCodeChallenge, generateCodeVerifier } from "@/utils/pkce";
import { useEffect, useState } from "react";

const Login = () => {
  const [codeVerifier, setCodeVerifier] = useState("");

  const handleServerSideLogin = async () => {
    window.location.href = "/api/auth/login";
  };

  const handleClientSideLogin = async () => {
    if (!codeVerifier) return;

    // 코드 챌린지를 생성
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 구글 인증 URL 생성
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    console.log(clientId);
    if (!clientId) return;

    const redirectUri = "http://localhost:3000/auth/callback";
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=openid%20profile%20email` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    // 코드 검증자를 세션 스토리지에 저장 (나중에 액세스 토큰 요청 시 사용)
    sessionStorage.setItem("code_verifier", codeVerifier);

    // 구글 인증 페이지로 리다이렉트
    window.location.href = authUrl;
  };

  useEffect(() => {
    // 페이지가 로드되면 코드 검증자를 생성하여 상태에 저장
    const verifier = generateCodeVerifier();
    setCodeVerifier(verifier);

    {
      /* FIXME: Client Side Login 주석처리로 인한 임시 콘솔 */
    }
    console.log(false && handleClientSideLogin);
  }, []);

  return (
    <div className="flex gap-2">
      <button
        className="bg-gray-300 p-2 rounded-lg font-semibold"
        onClick={handleServerSideLogin}
      >
        Server Side Login
      </button>
      {/* FIXME: 의미없어서 주석처리 */}
      {/* <button
        className="bg-gray-300 p-2 rounded-lg font-semibold"
        onClick={handleClientSideLogin}
      >
        Client Side Login
      </button> */}
    </div>
  );
};

export default Login;
