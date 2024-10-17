# Google Drive Appdata Test

* **https://www.googleapis.com/auth/drive.appdata** API를 테스트하기 위한 토이 프로젝트
* https://google-drive-appdata-test.vercel.app/

## Overview

Nextjs를 기반으로 ethers 라이브러리를 이용해 KeyPair를 생성하고 이를 구글 oAuth 로그인 후 구글 드라이브의 `appDataFolder`에 접근해 저장하고 읽을 수 
있는지를 검증합니다.

실제로 사용자는 `appDataFolder`를 드라이브 UI에서 확인할 수 없으며, 임의로 삭제할 수 없게하고, DApp에서만 이를 관리할 수 있도록 하는 것이 목적입니다.

## 테스트 환경

* Window
* Android
* IOS

## 개발 환경

* **NodeJS:** `v20.14.0` (LTS)
* **PackageManager:** `npm`
* **Next.js**: `14.2.15`

## Getting Started

### 실행

```bash
# Module Install
npm install

# Server start
npm run dev
```

### 환경변수

* **GOOGLE_CLIENT_ID**: Google Cloud Console에서 oAuth 클라이언트를 생성하고 클라이언트 ID를 입력합니다.
* **GOOGLE_CLIENT_SECRET**: Google Cloud Console에서 생성한 클라이언트의 비밀번호를 입력합니다.
* **NEXT_PUBLIC_BASE_URL**: 사이트의 Base URL을 입력합니다.

```plaintext
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Reference

* [https://developers.google.com/drive/api/guides/appdata?hl=ko](https://developers.google.com/drive/api/guides/appdata?hl=ko)