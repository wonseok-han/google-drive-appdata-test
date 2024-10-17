"use client";

import { SigningKey } from "ethers";
import { hexlify, randomBytes } from "ethers";

import { useState } from "react";

export default function Main() {
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [readKey, setReadKey] = useState("");

  // 무작위 프라이빗 키와 그로부터 퍼블릭 키 생성
  const generateRandomKeys = () => {
    // 32바이트의 무작위 데이터로 프라이빗 키 생성
    const privateKeyBytes = randomBytes(32);
    const privateKey = hexlify(privateKeyBytes); // 16진수 형식으로 변환

    // 프라이빗 키로부터 퍼블릭 키 생성

    const signingKey = new SigningKey(privateKey); // 압축되지 않은 퍼블릭 키
    // const publicKeyCompressed = utils.computePublicKey(privateKey, true); // 압축된 퍼블릭 키

    return {
      privateKey: signingKey.privateKey,
      publicKey: signingKey.publicKey,
    };
  };

  const handleGenerate = async () => {
    const generated = generateRandomKeys();

    setPrivateKey(generated.privateKey);
    setPublicKey(generated.publicKey);
  };

  const handleStore = async () => {
    if (!privateKey) return;
    try {
      const response = await fetch("/api/drive/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: privateKey }),
      });

      if (response.ok) {
        alert("키 저장 성공!");
      }
    } catch (error) {
      console.error("Error saving key:", error);
    }
  };

  const handleRead = async () => {
    try {
      const response = await fetch("/api/drive/read-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("키 읽어오기 성공!");
        const data = await response.json();
        setReadKey(data.key);
      }
    } catch (error) {
      console.error("Error saving key:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/drive/download-file", {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user-key.json"; // 파일 이름 설정
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download file:", await response.json());
      }
    } catch (error) {
      console.error("Error saving key:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청을 보내서 쿠키 제거
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

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

  return (
    <div>
      <div className="grid grid-flow-row gap-2 lg:flex">
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleGenerate}
        >
          Keypair Generate
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleStore}
        >
          Drive Store
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleRead}
        >
          Key Read
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleDownload}
        >
          PrivateKey Download
        </button>
        <button
          className="bg-red-400 p-2 rounded-lg font-semibold"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <table className="my-4 border-collapse w-full">
        <tbody>
          <tr>
            <th className="text-left p-2 bg-slate-200 border-gray-600 border-[1px]">
              privateKey
            </th>
            <td className="p-2 border-gray-600 border-[1px] break-all overflow-hidden">
              <p>{privateKey}</p>
            </td>
          </tr>
          <tr>
            <th className="text-left p-2 bg-slate-200 border-gray-600 border-[1px]">
              publicKey
            </th>
            <td className="p-2 border-gray-600 border-[1px] break-all overflow-hidden">
              <p>{publicKey}</p>
            </td>
          </tr>
          <tr>
            <th className="text-left p-2 bg-slate-200 border-gray-600 border-[1px]">
              readPrivateKey
            </th>
            <td className="p-2 border-gray-600 border-[1px] break-all overflow-hidden">
              <p>{readKey}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
