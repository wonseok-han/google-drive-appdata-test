export function generateCodeVerifier() {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);

  // Uint8Array를 number 배열로 변환 후 처리
  return btoa(
    Array.from(randomBytes)
      .map((byte) => String.fromCharCode(byte))
      .join("")
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  // Uint8Array를 Array로 변환하여 처리
  const base64String = Array.from(new Uint8Array(digest))
    .map((byte) => String.fromCharCode(byte))
    .join("");

  return btoa(base64String)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
