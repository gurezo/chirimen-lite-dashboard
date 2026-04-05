import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SerialError, SerialErrorCode } from '@gurezo/web-serial-rxjs';
import { catchError, map, of, switchMap } from 'rxjs';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { WebSerialActions } from './web-serial.actions';

// エラーメッセージ定数
const ERROR_MESSAGES = {
  CONNECTION_SUCCESS: 'Web Serial Open Success',
  CONNECTION_FAILED: '接続に失敗しました',
  NO_PORT_SELECTED: 'ポートが選択されませんでした',
  UNSUPPORTED_DEVICE:
    'サポートされていないデバイスです。Raspberry Pi Zero以外のデバイスは接続できません。',
} as const;

function connectFailureMessage(error: unknown): string {
  if (error instanceof SerialError) {
    if (error.is(SerialErrorCode.OPERATION_CANCELLED)) {
      return ERROR_MESSAGES.NO_PORT_SELECTED;
    }
    if (
      error.is(SerialErrorCode.PORT_NOT_AVAILABLE) ||
      error.is(SerialErrorCode.PORT_OPEN_FAILED)
    ) {
      return ERROR_MESSAGES.UNSUPPORTED_DEVICE;
    }
  }
  if (error instanceof Error && error.message?.includes('No port selected')) {
    return ERROR_MESSAGES.NO_PORT_SELECTED;
  }
  if (
    error instanceof Error &&
    (error.message?.includes('not a Raspberry Pi Zero') ||
      error.message?.includes('not supported'))
  ) {
    return ERROR_MESSAGES.UNSUPPORTED_DEVICE;
  }
  return ERROR_MESSAGES.CONNECTION_FAILED;
}

/**
 * WebSerialEffects
 * UI 通知は行わず、状態の更新のみを担当
 * Component 側で状態を監視して通知を表示すること
 */
@Injectable()
export class WebSerialEffects {
  actions$ = inject(Actions);
  service = inject(SerialFacadeService);

  init$ = createEffect(
    () => this.actions$.pipe(ofType(WebSerialActions.init)),
    { dispatch: false }
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.onConnect),
      switchMap(() =>
        this.service.connect$().pipe(
          switchMap((success) => {
            if (!success) {
              return of(
                WebSerialActions.onConnectFail({
                  isConnected: false,
                  errorMessage: ERROR_MESSAGES.CONNECTION_FAILED,
                })
              );
            }
            return of(
              WebSerialActions.onConnectSuccess({
                isConnected: true,
                message: ERROR_MESSAGES.CONNECTION_SUCCESS,
              })
            );
          }),
          catchError((error: unknown) => {
            return [
              WebSerialActions.onConnectFail({
                isConnected: false,
                errorMessage: connectFailureMessage(error),
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
        switchMap(() => this.service.disconnect$())
      ),
    { dispatch: false }
  );

  sendData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.sendData),
      switchMap((action) =>
        this.service.write$(action.sendData).pipe(
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
        this.service.read$().pipe(
          map((receiveData) => WebSerialActions.receiveData({ receiveData })),
          catchError(async (error) => WebSerialActions.error(error))
        )
      )
    )
  );
}
