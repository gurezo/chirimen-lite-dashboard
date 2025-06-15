import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WEB_SERIAL } from '../../../shared/constants';
import { TOAST } from '../../constants/toast.const';

@Injectable({
  providedIn: 'root',
})
export class ToastMessageService {
  toastr = inject(ToastrService);
  private portError = WEB_SERIAL.PORT.ERROR;
  private toastSuccess = TOAST.SUCCESS;
  private toastError = TOAST.ERROR;

  success(title: string, message: string): void {
    this.toastr.success(message, title);
  }

  error(title: string, message: string): void {
    this.toastr.error(message, title);
  }

  webSerailSuccess(): void {
    this.success(this.toastSuccess.OPEN_TITLE, this.toastSuccess.OPEN_MESSAGE);
  }

  webSerailError(connectedResult: string): void {
    this.toastr.error(
      this.createErrorMessages(connectedResult),
      this.toastError.FAIL
    );
  }

  createErrorMessages(connectedResult: string): string {
    switch (connectedResult) {
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
