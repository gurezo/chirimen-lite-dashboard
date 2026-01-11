import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { Store } from '@ngrx/store';
import { catchError, from, map, switchMap } from 'rxjs';
import { SerialFacadeService } from '../services/serial-facade.service';
import { WebSerialActions } from './web-serial.actions';

// エラーメッセージ定数
const ERROR_MESSAGES = {
  CONNECTION_SUCCESS: 'Web Serial Open Success',
  CONNECTION_FAILED: '接続に失敗しました',
  NO_PORT_SELECTED: 'ポートが選択されませんでした',
  UNSUPPORTED_DEVICE: 'サポートされていないデバイスです。Raspberry Pi Zero以外のデバイスは接続できません。',
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
  // store = inject(Store);

  init$ = createEffect(
    () => this.actions$.pipe(ofType(WebSerialActions.init)),
    { dispatch: false }
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.onConnect),
      switchMap(() =>
        from(this.service.connect()).pipe(
          map((success) => {
            if (success) {
              return WebSerialActions.onConnectSuccess({
                isConnected: true,
                message: ERROR_MESSAGES.CONNECTION_SUCCESS,
              });
            } else {
              return WebSerialActions.onConnectFail({
                isConnected: false,
                errorMessage: ERROR_MESSAGES.UNSUPPORTED_DEVICE,
              });
            }
          }),
          catchError((error) => {
            let errorMessage: string = ERROR_MESSAGES.CONNECTION_FAILED;
            if (error.message.includes('No port selected')) {
              errorMessage = ERROR_MESSAGES.NO_PORT_SELECTED;
            } else if (
              error.message.includes('not a Raspberry Pi Zero') ||
              error.message.includes('not supported')
            ) {
              errorMessage = ERROR_MESSAGES.UNSUPPORTED_DEVICE;
            }
            return [WebSerialActions.onConnectFail({
              isConnected: false,
              errorMessage: errorMessage,
            })];
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
