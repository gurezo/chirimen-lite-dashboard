import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WEB_SERIAL } from '../../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class ToastMessageService {
  toastr = inject(ToastrService);
  private portError = WEB_SERIAL.PORT.ERROR;

  success(title: string, message: string): void {
    this.toastr.success(message, title);
  }

  error(title: string, message: string): void {
    this.toastr.error(message, title);
  }

  webSerailSuccess(): void {
    this.success(
      'Raspberry Pi Zero に正常接続されました。',
      'Web Serial Open Success'
    );
  }

  webSerailError(connectedResult: string): void {
    this.toastr.error(
      this.createErrorMessages(connectedResult),
      'Web Serial Open Fail'
    );
  }

  createErrorMessages(connectedResult: string): string {
    switch (connectedResult) {
      case WEB_SERIAL.RASPBERRY_PI.IS_NOT_ZERO:
        return '接続されたデバイスは Raspberry Pi Zero ではありません。';
      case this.portError.NO_SELECTED:
        return 'ポートが選択されていません。';
      case this.portError.PORT_ALREADY_OPEN:
        return 'Raspberry Pi Zero が接続されたままです。';
      case this.portError.PORT_OPEN_FAIL:
        return 'Web Serial ポートの接続に失敗しました。';
      default:
        return '原因不明のエラーです。';
    }
  }
}
