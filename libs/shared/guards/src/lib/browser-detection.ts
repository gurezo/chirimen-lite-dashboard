/**
 * ブラウザの種類を判定するユーティリティ関数
 */
export function detectBrowser(): {
  isChrome: boolean;
  isEdge: boolean;
  isOpera: boolean;
} {
  const userAgent = window.navigator.userAgent.toLowerCase();

  // デスクトップ版のChrome, Edge, Operaの判定
  const isChrome = /chrome/.test(userAgent) && !/edge|opr/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isOpera = /opr/.test(userAgent);

  return { isChrome, isEdge, isOpera };
}

/**
 * 対応ブラウザかどうかを判定する
 */
export function isSupportedBrowser(): boolean {
  const { isChrome, isEdge, isOpera } = detectBrowser();
  return isChrome || isEdge || isOpera;
}
