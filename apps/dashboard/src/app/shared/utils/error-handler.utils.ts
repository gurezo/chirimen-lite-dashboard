/**
 * エラーハンドリングユーティリティ
 *
 * porting/utils/error-handler.ts から移行
 */
export class ErrorHandler {
  /**
   * エラーメッセージを標準化された形式で取得
   *
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  static getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  /**
   * エラーを適切な形式でラップ
   *
   * @param error エラーオブジェクト
   * @param context コンテキスト情報
   * @returns ラップされた Error オブジェクト
   */
  static wrapError(error: unknown, context: string): Error {
    const message = this.getErrorMessage(error);
    return new Error(`${context}: ${message}`);
  }

  /**
   * エラーログを出力
   *
   * @param error エラーオブジェクト
   * @param context コンテキスト情報
   */
  static logError(error: unknown, context: string): void {
    const message = this.getErrorMessage(error);
    console.error(`[${context}] Error:`, message);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * エラーが特定の型かチェック
   *
   * @param error エラーオブジェクト
   * @param errorType エラー型
   * @returns 該当する場合 true
   */
  static isErrorType<T extends Error>(
    error: unknown,
    errorType: new (...args: unknown[]) => T
  ): error is T {
    return error instanceof errorType;
  }
}
