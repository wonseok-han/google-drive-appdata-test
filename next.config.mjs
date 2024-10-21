/** @type {import('next').NextConfig} */

import WebpackObfuscator from "webpack-obfuscator";

const nextConfig = {
  webpack: (config, { isServer }) => {
    // 클라이언트 사이드 코드에만 난독화를 적용하도록 설정
    if (!isServer) {
      //   config.optimization = {
      //     splitChunks: {
      //       cacheGroups: {
      //         businessLogic: {
      //           test: /[\\/]src[\\/]utils[\\/]/, // 비즈니스 로직을 포함하는 유틸리티 파일 등을 분리
      //           name: "businessLogic",
      //           chunks: "all",
      //         },
      //       },
      //     },
      //   };
      config.plugins.push(
        new WebpackObfuscator(
          {
            rotateStringArray: true, // 난독화 옵션 설정
            stringArray: true,
            stringArrayThreshold: 0.75,
          },
          [
            // "static/**/*.js",
            "**/node_modules/**", // 외부 라이브러리 제외
            // "**/*.runtime.js", // runtime 관련 파일 제외
            // "static/**/app/*.js",
            // "static/**/app-pages-internals.js",
            // "static/**/webpack.js*",
          ] // 특정 파일들을 제외하거나 타겟으로 설정
        )
      );
    }

    return config;
  },
};

export default nextConfig;
