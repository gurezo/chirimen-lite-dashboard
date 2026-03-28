import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WifiConfigService } from '@libs-wifi-data-access';
import { NotificationService } from '@libs-shared-ui';

export interface WifiConnectDialogData {
  initialSsid?: string;
}

@Component({
  selector: 'choh-wifi-connect-dialog',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="flex flex-col gap-4 p-4 min-w-[280px]">
      <h2 class="text-lg font-medium m-0">WiFi に接続</h2>
      <form class="flex flex-col gap-3" (ngSubmit)="$event.preventDefault(); connect()">
        <mat-form-field appearance="outline">
          <mat-label>SSID</mat-label>
          <input matInput name="ssid" [(ngModel)]="ssid" [disabled]="connecting()" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>パスワード</mat-label>
          <input
            matInput
            type="password"
            name="password"
            [(ngModel)]="password"
            [disabled]="connecting()"
            autocomplete="off"
          />
        </mat-form-field>
        <div class="flex justify-end gap-2">
          <button
            mat-stroked-button
            type="button"
            (click)="cancel()"
            [disabled]="connecting()"
          >
            キャンセル
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="connecting()">
            @if (connecting()) {
              接続中…
            } @else {
              接続
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class WifiConnectDialogComponent implements OnInit {
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly data = inject<WifiConnectDialogData | null>(DIALOG_DATA, {
    optional: true,
  });
  private readonly wifiConfig = inject(WifiConfigService);
  private readonly notify = inject(NotificationService);

  ssid = '';
  password = '';
  readonly connecting = signal(false);

  ngOnInit(): void {
    this.ssid = this.data?.initialSsid?.trim() ?? '';
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  async connect(): Promise<void> {
    const trimmed = this.ssid.trim();
    if (!trimmed) {
      this.notify.error('WiFi', 'SSID を入力してください');
      return;
    }
    this.connecting.set(true);
    try {
      await this.wifiConfig.setWiFi(trimmed, this.password);
      this.notify.success('WiFi', '接続処理が完了しました');
      this.dialogRef.close(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '接続に失敗しました';
      this.notify.error('WiFi', msg);
    } finally {
      this.connecting.set(false);
    }
  }
}
