/**
 * Raspberry Pi OS シリアルコンソールのデフォルト認証（Issue #498）
 */
export const PI_ZERO_LOGIN_USER = 'pi' as const;
export const PI_ZERO_LOGIN_PASSWORD = 'raspberry' as const;

/**
 * ログイン名入力待ち（行末の `login:` を検出）
 */
export const PI_ZERO_SERIAL_LOGIN_LINE_PATTERN = /[^\r\n]*login:\s*$/im;

/**
 * パスワード入力待ち（`Password:` / `password:` 行末）
 */
export const PI_ZERO_SERIAL_PASSWORD_LINE_PATTERN =
  /[^\r\n]*[Pp]assword:\s*$/im;
