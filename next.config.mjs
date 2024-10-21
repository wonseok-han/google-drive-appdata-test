/** @type {import('next').NextConfig} */

import WebpackObfuscator from "webpack-obfuscator";

const nextConfig = {
  webpack: (config, { isServer }) => {
    // 클라이언트 사이드 코드에만 난독화를 적용하도록 설정
    if (!isServer) {
      config.plugins.push(
        new WebpackObfuscator(
          {
            rotateStringArray: true, // 난독화 옵션 설정
            stringArray: true,
            stringArrayThreshold: 0.75,
          },
          ["static/**/*.js"] // 특정 파일들을 제외하거나 타겟으로 설정
        )
      );
    }

    return config;
  },
};

export default nextConfig;
