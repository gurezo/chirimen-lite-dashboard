import { inject, Injectable } from '@angular/core';
import { TOAST, WEB_SERIAL } from '@dashboard/constants';
import { NotificationService } from './notification.service';

/**
 * Web Serial 専用の通知サービス
 * Web Serial に関連する通知メッセージを管理
 */
@Injectable({
  providedIn: 'root',
})
export class SerialNotificationService {
  private notification = inject(NotificationService);
  private portError = WEB_SERIAL.PORT.ERROR;
  private toastSuccess = TOAST.SUCCESS;
  private toastError = TOAST.ERROR;

  /**
   * シリアル接続成功の通知
   */
  notifyConnectionSuccess(): void {
    this.notification.success(
      this.toastSuccess.OPEN_TITLE,
      this.toastSuccess.OPEN_MESSAGE
    );
  }

  /**
   * シリアル接続エラーの通知
   * @param errorType エラータイプ
   */
  notifyConnectionError(errorType: string): void {
    const message = this.createConnectionErrorMessage(errorType);
    this.notification.error(this.toastError.FAIL, message);
  }

  /**
   * シリアル読み取りエラーの通知
   * @param error エラー内容
   */
  notifyReadError(error: unknown): void {
    const message =
      error instanceof Error ? error.message : 'Unknown read error';
    this.notification.error('Read Error', message);
  }

  /**
   * シリアル書き込みエラーの通知
   * @param error エラー内容
   */
  notifyWriteError(error: unknown): void {
    const message =
      error instanceof Error ? error.message : 'Unknown write error';
    this.notification.error('Write Error', message);
  }

  /**
   * 接続エラーメッセージを生成
   * @param errorType エラータイプ
   * @returns エラーメッセージ
   */
  private createConnectionErrorMessage(errorType: string): string {
    switch (errorType) {
      case WEB_SERIAL.RASPBERRY_PI.IS_NOT_ZERO:
        return this.toastError.NOT_FOUND_MESSAGE;
      case this.portError.NO_SELECTED:
        return this.toastError.NO_SELECTED;
      case this.portError.PORT_ALREADY_OPEN:
        return this.toastError.PORT_ALREADY_OPEN;
      case this.portError.PORT_OPEN_FAIL:
        return this.toastError.PORT_OPEN_FAIL;
      default:
        return this.toastError.UNKNOWN;
    }
  }
}
