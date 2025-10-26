/**
 * カスタムエラークラス
 *
 * porting/utils/serial.errors.ts から移行
 */

/**
 * Serial 関連エラー
 */
export class SerialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SerialError';
  }
}

/**
 * File 関連エラー
 */
export class FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileError';
  }
}

/**
 * Editor 関連エラー
 */
export class EditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EditorError';
  }
}

/**
 * WiFi 関連エラー
 */
export class WiFiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WiFiError';
  }
}

/**
 * CHIRIMEN 関連エラー
 */
export class ChirimenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChirimenError';
  }
}

/**
 * Directory 関連エラー
 */
export class DirectoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DirectoryError';
  }
}

/**
 * System 関連エラー
 */
export class SystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemError';
  }
}

/**
 * Authentication 関連エラー
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

