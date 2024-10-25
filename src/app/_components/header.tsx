"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "./loading";

const Header = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const getAccessToken = async () => {
    const response = await fetch("/api/auth/access-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      setAccessToken(data.access_token);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // 서버에 로그아웃 요청을 보내서 쿠키 제거
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      setIsLoading(false);

      if (response.ok) {
        // 쿠키가 삭제되면 로그인 페이지로 리디렉션
        window.location.href = "/login";
      } else {
        console.error("Failed to logout:", await response.json());
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <header className="px-4 py-3 w-full flex-none">
      <div>
        <nav className="flex justify-between">
          <button className="bg-gray-300 p-2 rounded-full font-semibold">
            <Link href="/">Home</Link>
          </button>

          {accessToken && (
            <button
              className="bg-red-400 p-2 rounded-lg font-semibold"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </nav>
        <span className="flex justify-center font-black text-3xl">
          Google Drive AppData Test
        </span>
      </div>
      {isLoading && <Loading />}
    </header>
  );
};

export default Header;
