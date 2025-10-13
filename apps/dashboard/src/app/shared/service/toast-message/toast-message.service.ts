import { inject, Injectable } from '@angular/core';
import { SerialNotificationService } from '../notification/serial-notification.service';

/**
 * @deprecated このサービスは非推奨です。以下を使用してください:
 * - 汎用通知: NotificationService
 * - Web Serial 通知: SerialNotificationService
 *
 * 後方互換性のために残されています。
 */
@Injectable({
  providedIn: 'root',
})
export class ToastMessageService {
  private serialNotification = inject(SerialNotificationService);

  /**
   * @deprecated NotificationService.success() を使用してください
   */
  success(title: string, message: string): void {
    console.warn(
      'ToastMessageService.success() is deprecated. Use NotificationService.success() instead.'
    );
    // 後方互換性のため実装は保持
  }

  /**
   * @deprecated NotificationService.error() を使用してください
   */
  error(title: string, message: string): void {
    console.warn(
      'ToastMessageService.error() is deprecated. Use NotificationService.error() instead.'
    );
    // 後方互換性のため実装は保持
  }

  /**
   * @deprecated SerialNotificationService.notifyConnectionSuccess() を使用してください
   */
  webSerailSuccess(): void {
    this.serialNotification.notifyConnectionSuccess();
  }

  /**
   * @deprecated SerialNotificationService.notifyConnectionError() を使用してください
   */
  webSerailError(connectedResult: string): void {
    this.serialNotification.notifyConnectionError(connectedResult);
  }

  /**
   * @deprecated SerialNotificationService の内部メソッドを使用してください
   */
  createErrorMessages(connectedResult: string): string {
    console.warn(
      'ToastMessageService.createErrorMessages() is deprecated and should not be used directly.'
    );
    return connectedResult;
  }
}
