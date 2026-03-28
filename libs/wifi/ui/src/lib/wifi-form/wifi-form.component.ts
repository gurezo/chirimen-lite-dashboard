import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface WifiFormSubmit {
  ssid: string;
  password: string;
}

/**
 * SSID / パスワード入力フォーム
 */
@Component({
  selector: 'choh-wifi-form',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <form class="flex flex-row items-center" (ngSubmit)="onSubmit($event)">
      <mat-form-field class="mr-2.5">
        <mat-label>SSID</mat-label>
        <input matInput type="text" name="ssid" [(ngModel)]="ssid" />
      </mat-form-field>
      <mat-form-field class="mr-2.5">
        <mat-label>Password</mat-label>
        <input matInput [type]="'password'" name="password" [(ngModel)]="password" />
      </mat-form-field>
    </form>
  `,
})
export class WifiFormComponent {
  ssid = '';
  password = '';

  readonly formSubmit = output<WifiFormSubmit>();

  onSubmit(event: Event): void {
    event.preventDefault();
    this.formSubmit.emit({ ssid: this.ssid, password: this.password });
  }
}
