import { Component, inject, input, OnInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true のときキャンセルボタンを出さない（情報表示のみ） */
  hideCancel?: boolean;
}

@Component({
  selector: 'lib-confirm-dialog',
  template: `
    <div class="dialog-content">
      @if (title) {
        <h2>{{ title }}</h2>
      }
      @if (message) {
        <p>{{ message }}</p>
      }
      <div class="dialog-actions">
        @if (!hideCancel) {
          <button type="button" (click)="cancel()">{{ cancelLabel }}</button>
        }
        <button type="button" (click)="confirm()">{{ confirmLabel }}</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-content {
        padding: 1rem;
      }
      .dialog-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        justify-content: flex-end;
      }
    `,
  ],
})
export class ConfirmDialogComponent implements OnInit {
  private dialogRef = inject(DialogRef<boolean>, { optional: true });
  private data = inject<ConfirmDialogData | null>(DIALOG_DATA, { optional: true });

  readonly titleInput = input('Confirm', { alias: 'title' });
  readonly messageInput = input('Are you sure?', { alias: 'message' });
  readonly confirmLabelInput = input('OK', { alias: 'confirmLabel' });
  readonly cancelLabelInput = input('Cancel', { alias: 'cancelLabel' });
  readonly hideCancelInput = input(false, { alias: 'hideCancel' });

  title = 'Confirm';
  message = 'Are you sure?';
  confirmLabel = 'OK';
  cancelLabel = 'Cancel';
  hideCancel = false;

  ngOnInit(): void {
    this.title = this.titleInput();
    this.message = this.messageInput();
    this.confirmLabel = this.confirmLabelInput();
    this.cancelLabel = this.cancelLabelInput();
    this.hideCancel = this.hideCancelInput();
    if (this.data) {
      if (this.data.title != null) this.title = this.data.title;
      if (this.data.message != null) this.message = this.data.message;
      if (this.data.confirmLabel != null) this.confirmLabel = this.data.confirmLabel;
      if (this.data.cancelLabel != null) this.cancelLabel = this.data.cancelLabel;
      if (this.data.hideCancel === true) this.hideCancel = true;
    }
  }

  confirm(): void {
    this.dialogRef?.close(true);
  }

  cancel(): void {
    this.dialogRef?.close(false);
  }
}
