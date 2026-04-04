import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { createConnectClient } from '@libs-connect-util';
import { WebSerialActions } from './web-serial.actions';

// エラーメッセージ定数
const ERROR_MESSAGES = {
  CONNECTION_SUCCESS: 'Web Serial Open Success',
  CONNECTION_FAILED: '接続に失敗しました',
  NO_PORT_SELECTED: 'ポートが選択されませんでした',
  UNSUPPORTED_DEVICE:
    'サポートされていないデバイスです。Raspberry Pi Zero以外のデバイスは接続できません。',
} as const;

/**
 * WebSerialEffects
 * UI 通知は行わず、状態の更新のみを担当
 * Component 側で状態を監視して通知を表示すること
 */
@Injectable()
export class WebSerialEffects {
  actions$ = inject(Actions);
  service = inject(SerialFacadeService);

  private async initializeAfterConnect(): Promise<void> {
    const client = createConnectClient();
    try {
      // まずログイン済み/シェル待ちを軽く確認
      await this.service.readUntilPrompt(client.prompt, 5000, 0);

      // TZ 設定は best-effort（sudo/prompt 問題で失敗しても接続成功扱い）
      for (const cmd of client.timezoneCommands) {
        try {
          await this.service.exec(cmd, client.prompt, 10000, 0);
        } catch (error) {
          console.warn(`Initial command failed: ${cmd}`, error);
        }
      }
    } catch {
      // readUntilPrompt が失敗しても接続成功扱い
    }
  }

  init$ = createEffect(
    () => this.actions$.pipe(ofType(WebSerialActions.init)),
    { dispatch: false }
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.onConnect),
      switchMap(() =>
        from(this.service.connect()).pipe(
          switchMap((success) => {
            if (!success) {
              return of(
                WebSerialActions.onConnectFail({
                  isConnected: false,
                  errorMessage: ERROR_MESSAGES.UNSUPPORTED_DEVICE,
                })
              );
            }
            // ポート確立直後に UI を接続済みへ（initializeAfterConnect はターミナル表示後に続行）
            void this.initializeAfterConnect().catch((err) =>
              console.warn('Post-connect initialization failed', err)
            );
            return of(
              WebSerialActions.onConnectSuccess({
                isConnected: true,
                message: ERROR_MESSAGES.CONNECTION_SUCCESS,
              })
            );
          }),
          catchError((error) => {
            let errorMessage: string = ERROR_MESSAGES.CONNECTION_FAILED;
            if (error.message?.includes('No port selected')) {
              errorMessage = ERROR_MESSAGES.NO_PORT_SELECTED;
            } else if (
              error.message?.includes('not a Raspberry Pi Zero') ||
              error.message?.includes('not supported')
            ) {
              errorMessage = ERROR_MESSAGES.UNSUPPORTED_DEVICE;
            }
            return [
              WebSerialActions.onConnectFail({
                isConnected: false,
                errorMessage: errorMessage,
              }),
            ];
          })
        )
      )
    )
  );

  disConnect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WebSerialActions.onDisConnect),
        switchMap(() => from(this.service.disconnect()))
      ),
    { dispatch: false }
  );

  sendData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.sendData),
      switchMap((action) =>
        from(this.service.write(action.sendData)).pipe(
          map(() => WebSerialActions.onSendSuccess()),
          catchError(async (error) => WebSerialActions.error(error))
        )
      )
    )
  );

  receiveData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.receiveData),
      switchMap(() =>
        from(this.service.read()).pipe(
          map((receiveData) => WebSerialActions.receiveData({ receiveData })),
          catchError(async (error) => WebSerialActions.error(error))
        )
      )
    )
  );
}
