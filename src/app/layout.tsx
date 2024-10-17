import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "google-drive-appdata-test",
  description: "Google Drive AppData Test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full flex flex-col gap-5 mx-auto max-w-3xl px-6 min-h-screen lg:max-w-6xl lg:px-8`}
      >
        <header className="px-4 py-3 w-full flex-none flex justify-center font-black text-3xl">
          Google Drive AppData Test
        </header>
        <main className="w-full">{children}</main>
        <footer className="px-4 py-3 w-full bg-gray-400 flex justify-center flex-1">
          © {new Date().getFullYear()}{" "}
          {`wonseok-han's Google Drive AppData Test`}
        </footer>
      </body>
    </html>
  );
}
