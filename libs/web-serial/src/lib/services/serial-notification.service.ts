import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SerialNotificationService {
  private toastr = inject(ToastrService);

  /**
   * Web Serial接続成功時の通知
   */
  notifyConnectionSuccess(): void {
    this.toastr.success('Web Serial接続が成功しました', '接続成功', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  /**
   * Web Serial接続エラー時の通知
   * @param errorMessage エラーメッセージ
   */
  notifyConnectionError(errorMessage: string): void {
    this.toastr.error(
      `Web Serial接続エラー: ${errorMessage}`,
      '接続エラー',
      {
        timeOut: 5000,
        positionClass: 'toast-top-right',
      }
    );
  }

  /**
   * Web Serial切断時の通知
   */
  notifyDisconnection(): void {
    this.toastr.info('Web Serial接続が切断されました', '切断', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  /**
   * Web Serialデバイス検出時の通知
   * @param deviceName デバイス名
   */
  notifyDeviceDetected(deviceName: string): void {
    this.toastr.success(
      `デバイスを検出しました: ${deviceName}`,
      'デバイス検出',
      {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      }
    );
  }
}
