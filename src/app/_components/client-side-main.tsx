"use client";

import { SigningKey } from "ethers";
import { hexlify, randomBytes } from "ethers";
import { useEffect, useState } from "react";
import Loading from "./loading";

const DEFAULT_FILE_NAME = "user-key.json";

export default function ClientSideMain() {
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  const [fileList, setFileList] = useState<
    {
      id: string;
      name: string;
      content: {
        key: string;
      };
      createdTime: string;
    }[]
  >([]);

  // 무작위 프라이빗 키와 그로부터 퍼블릭 키 생성
  const generateRandomKeys = () => {
    // 32바이트의 무작위 데이터로 프라이빗 키 생성
    const privateKeyBytes = randomBytes(32);
    const privateKey = hexlify(privateKeyBytes); // 16진수 형식으로 변환

    // 프라이빗 키로부터 퍼블릭 키 생성
    const signingKey = new SigningKey(privateKey); // 압축되지 않은 퍼블릭 키

    return {
      privateKey: signingKey.privateKey,
      publicKey: signingKey.publicKey,
    };
  };

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

  const handleGenerate = async () => {
    const generated = generateRandomKeys();

    setPrivateKey(generated.privateKey);
    setPublicKey(generated.publicKey);
  };

  const handleStore = async () => {
    if (!accessToken) return;
    if (!privateKey) return;

    const fileName = prompt("Enter the file name to save:", DEFAULT_FILE_NAME); // 사용자가 파일 이름을 입력하게 함
    if (!fileName) return;

    setIsLoading(true);

    const metadata = {
      name: fileName, // 파일 이름
      parents: ["appDataFolder"], // Google Drive의 App Data Folder에 저장
    };

    const fileData = {
      key: privateKey, // 저장하려는 데이터
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formData.append(
      "file",
      new Blob([JSON.stringify(fileData)], { type: "application/json" })
    );

    try {
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("File uploaded successfully:", data);
        alert("키 저장 성공!");
      } else {
        throw new Error(data.error.message || "Failed to upload file");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!accessToken) return;

    try {
      // 사용자에게 다운로드할 파일 이름을 입력하게 함
      const fileName = prompt(
        "Enter the file name to download:",
        DEFAULT_FILE_NAME
      );
      if (!fileName) return;

      setIsLoading(true);

      // 파일 목록 조회
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=parents in 'appDataFolder'&spaces=appDataFolder&fields=files(id,name)",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error.message || "Failed to list files");
      }

      // 사용자가 입력한 파일명을 가진 파일들 필터링
      const filesToDownload = data.files.filter(
        (file: { id: string; name: string }) => file.name === fileName
      );

      if (filesToDownload.length === 0) {
        alert("No files found with the given name.");
        setIsLoading(false);
        return;
      }

      // 각 파일에 대한 다운로드 요청 생성
      const downloadPromises = filesToDownload.map(
        (file: { id: string; name: string }) =>
          fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )
      );

      // 모든 다운로드 요청이 완료될 때까지 기다림
      const downloadResponses = await Promise.all(downloadPromises);

      // 모든 응답 처리 - 성공한 파일을 Blob으로 처리하여 다운로드
      downloadResponses.forEach(async (response, index) => {
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filesToDownload[index].name; // 파일 이름 설정
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          console.error(
            `Failed to download file: ${filesToDownload[index].name}`
          );
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error downloading files:", error);
      setError("Failed to download specified files");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken) return;

    try {
      const fileName = prompt(
        "Enter the file name to delete:",
        DEFAULT_FILE_NAME
      ); // 사용자가 파일 이름을 입력하게 함
      if (!fileName) return;

      setIsLoading(true);

      // 파일 목록 조회
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=parents in 'appDataFolder'&spaces=appDataFolder&fields=files(id,name)",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error.message || "Failed to list files");
      }

      const filesToDelete = data.files.filter(
        (file: { id: string; name: string }) => file.name === fileName
      );

      const deletePromises = filesToDelete.map(
        (file: { id: string; name: string }) =>
          fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
      );
      // 모든 삭제 요청이 완료될 때까지 기다림
      const deleteResponses = await Promise.all(deletePromises);
      // 모든 삭제가 성공적으로 이루어졌는지 확인
      const allSuccess = deleteResponses.every((res) => res.ok);

      if (allSuccess) {
        console.log(`All files named "${fileName}" deleted successfully`);
        alert("파일 삭제 성공!");
        // 파일 목록 업데이트
        setFileList(
          data.files.filter(
            (file: { id: string; name: string }) => file.name !== fileName
          )
        );
      } else {
        throw new Error("Some files could not be deleted");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=parents in 'appDataFolder'&spaces=appDataFolder&fields=files(id,name,createdTime)",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error.message || "Failed to list files");
      }

      // 각 파일의 내용을 가져오기 위해 Promise.all() 사용
      const files = data.files;
      const filesWithContentPromises = files.map(
        async (file: { id: string; name: string }) => {
          const contentResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!contentResponse.ok) {
            throw new Error(`Failed to fetch content for file: ${file.name}`);
          }

          // 파일의 내용을 JSON 형태로 파싱
          const content = await contentResponse.json();
          return { ...file, content };
        }
      );

      // 모든 파일의 내용을 병렬로 가져오기
      const filesWithContent = await Promise.all(filesWithContentPromises);
      setFileList(filesWithContent);

      setIsLoading(false);
    } catch (error) {
      console.error("Error listing files:", error);
      setError("Failed to list files");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h1 className="text-3xl font-bold mb-3">Client Side</h1>
      <div className="grid grid-flow-row gap-2 lg:flex">
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleGenerate}
        >
          Generate Keypair
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleStore}
        >
          Store PrivateKey
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleDownload}
        >
          Download PrivateKey
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleDelete}
        >
          Remove PrivateKey
        </button>
        <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleSearch}
        >
          Search Files
        </button>
      </div>
      <table className="my-4 border-collapse w-full">
        <tbody>
          <tr>
            <th className="text-left p-2 bg-slate-200 border-gray-600 border-[1px] w-28">
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
              File List
            </th>
            <td className="p-2 border-gray-600 border-[1px] break-all overflow-hidden">
              {fileList.map((file) => (
                <div
                  key={file.id}
                  className="p-2 rounded-md border-[1px] border-gray-500"
                >
                  <div>
                    <label className="font-semibold">File ID</label>
                    <p className="ml-3">{file.id}</p>
                  </div>
                  <div>
                    <label className="font-semibold">File Name</label>
                    <p className="ml-3">{file.name}</p>
                  </div>
                  <div>
                    <label className="font-semibold">PrivateKey</label>
                    <p className="ml-3">{file.content.key}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Created</label>
                    <p className="ml-3">{file.createdTime}</p>
                  </div>
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {isLoading && <Loading />}
    </div>
  );
}
