import { isBrowserSupported as isBrowserSupportedFromLib } from '@gurezo/web-serial-rxjs';

/**
 * 対応ブラウザかどうかを判定する
 * @gurezo/web-serial-rxjs の isBrowserSupported に委譲する薄いラッパー
 */
export function isSupportedBrowser(): boolean {
  return isBrowserSupportedFromLib();
}
