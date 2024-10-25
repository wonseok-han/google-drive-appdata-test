"use client";

import { SigningKey } from "ethers";
import { hexlify, randomBytes } from "ethers";

import { useState } from "react";
import Loading from "./loading";

const DEFAULT_FILE_NAME = "user-key.json";

export default function ServerSideMain() {
  const [isLoading, setIsLoading] = useState(false);

  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  /* FIXME: File List가 있으므로 Read 주석처리 */
  // const [readKey, setReadKey] = useState("");

  const [fileList, setFileList] = useState<
    {
      id: string;
      name: string;
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
      const fileName = prompt(
        "Enter the file name to save:",
        DEFAULT_FILE_NAME
      ); // 사용자가 파일 이름을 입력하게 함
      if (!fileName) return;

      setIsLoading(true);

      const response = await fetch("/api/drive/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: privateKey, fileName }),
      });

      if (response.ok) {
        alert("키 저장 성공!");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error saving key:", error);
    }
  };

  /* FIXME: File List가 있으므로 Read 주석처리 */
  // const handleRead = async () => {
  //   try {
  //     const fileName = prompt(
  //       "Enter the file name to read:",
  //       DEFAULT_FILE_NAME
  //     ); // 사용자가 파일 이름을 입력하게 함
  //     if (!fileName) return;

  //     setIsLoading(true);

  //     const response = await fetch(
  //       `/api/drive/read-data?fileName=${fileName}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       alert("키 읽어오기 성공!");
  //       const data = await response.json();
  //       setReadKey(data.key);
  //     }
  //   } catch (error) {
  //     console.error("Error saving key:", error);
  //   }
  // };

  const handleDownload = async () => {
    try {
      const fileName = prompt(
        "Enter the file name to download:",
        DEFAULT_FILE_NAME
      ); // 사용자가 파일 이름을 입력하게 함
      if (!fileName) return;

      setIsLoading(true);

      const response = await fetch(
        `/api/drive/download-file?fileName=${fileName}`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = DEFAULT_FILE_NAME; // 파일 이름 설정
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download file:", await response.json());
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error saving key:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const fileName = prompt(
        "Enter the file name to delete:",
        DEFAULT_FILE_NAME
      ); // 사용자가 파일 이름을 입력하게 함
      if (!fileName) return;

      setIsLoading(true);

      const response = await fetch("/api/drive/delete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      });

      if (response.ok) {
        alert("파일 삭제 성공!");

        const response = await fetch("/api/drive/search-files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName }),
        });

        if (response.ok) {
          const data = await response.json();
          setFileList(data.files); // 검색된 파일 목록 설정
        } else {
          console.error("Failed to search files:", await response.json());
        }
      } else {
        console.error("Failed to delete file:", await response.json());
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSearch = async () => {
    try {
      const fileName = prompt(
        "Enter the file name to search:",
        DEFAULT_FILE_NAME
      ); // 사용자가 파일 이름을 입력하게 함
      if (!fileName) return;

      setIsLoading(true);

      const response = await fetch("/api/drive/search-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      });

      if (response.ok) {
        const data = await response.json();
        setFileList(data.files); // 검색된 파일 목록 설정
      } else {
        console.error("Failed to search files:", await response.json());
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error searching files:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-3">Server Side</h1>
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
        {/* FIXME: File List가 있으므로 Read 주석처리 */}
        {/* <button
          className="bg-gray-300 p-2 rounded-lg font-semibold"
          onClick={handleRead}
        >
          Read PrivateKey
        </button> */}
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
          {/* FIXME: File List가 있으므로 Read 주석처리 */}
          {/* <tr>
            <th className="text-left p-2 bg-slate-200 border-gray-600 border-[1px]">
              readPrivateKey
            </th>
            <td className="p-2 border-gray-600 border-[1px] break-all overflow-hidden">
              <p>{readKey}</p>
            </td>
          </tr> */}
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
