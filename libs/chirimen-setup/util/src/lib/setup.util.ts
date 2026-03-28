/**
 * Pi Zero（linux-armv6l）向け Node.js 非公式ビルドのデフォルト URL。
 * 必要に応じて UI から差し替え可能。
 */
export const DEFAULT_NODE_TAR_URL =
  'https://unofficial-builds.nodejs.org/download/release/v20.18.1/node-v20.18.1-linux-armv6l.tar.xz';

/**
 * #412 のチュートリアル手順に合わせたプロジェクトサブディレクトリのデフォルト（chirimenSetup 配下）
 */
export const DEFAULT_PROJECT_SUBDIR = 'pizero';

export function isValidNodeTarUrl(url: string): boolean {
  const t = url.trim();
  if (!t) {
    return false;
  }
  try {
    const u = new URL(t);
    return u.protocol === 'https:' && u.hostname === 'unofficial-builds.nodejs.org';
  } catch {
    return false;
  }
}

/**
 * 英数字・ハイフン・アンダースコアのみ許可（パスインジェクション防止）
 */
export function sanitizeProjectSubdir(name: string): string {
  const s = name.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return s.length > 0 ? s : DEFAULT_PROJECT_SUBDIR;
}

export function isSetupReady(): boolean {
  // TODO: セットアップ完了状態の確認ロジックを実装する。
  return false;
}
