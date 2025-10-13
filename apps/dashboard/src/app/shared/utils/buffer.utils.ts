/**
 * バッファ操作ユーティリティ
 *
 * porting/utils/buffer.ts から移行
 */

/**
 * 文字列を ArrayBuffer に変換
 *
 * @param str 文字列
 * @returns ArrayBuffer
 */
export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

/**
 * ArrayBuffer を文字列に変換
 *
 * @param buffer ArrayBuffer
 * @returns 文字列
 */
export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

/**
 * 複数の ArrayBuffer を連結
 *
 * @param buffers ArrayBuffer の配列
 * @returns 連結された ArrayBuffer
 */
export const concatArrayBuffers = (buffers: ArrayBuffer[]): ArrayBuffer => {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result.buffer;
};

/**
 * ArrayBuffer を Base64 に変換
 *
 * @param buffer ArrayBuffer
 * @returns Base64 文字列
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Base64 を ArrayBuffer に変換
 *
 * @param base64 Base64 文字列
 * @returns ArrayBuffer
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
