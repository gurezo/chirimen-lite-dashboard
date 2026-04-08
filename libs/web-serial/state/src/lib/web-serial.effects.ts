import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, of, switchMap } from 'rxjs';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { getConnectionErrorMessage } from '@libs-web-serial-util';
import { WebSerialActions } from './web-serial.actions';

const CONNECTION_SUCCESS_MESSAGE = 'Web Serial Open Success';

/**
 * WebSerialEffects
 * UI 通知は行わず、状態の更新のみを担当
 * Component 側で状態を監視して通知を表示すること
 */
@Injectable()
export class WebSerialEffects {
  actions$ = inject(Actions);
  service = inject(SerialFacadeService);

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.onConnect),
      switchMap(() =>
        this.service.connect$().pipe(
          switchMap((result) => {
            if (!result.ok) {
              return of(
                WebSerialActions.onConnectFail({
                  isConnected: false,
                  errorMessage: result.errorMessage,
                }),
              );
            }
            return of(
              WebSerialActions.onConnectSuccess({
                isConnected: true,
                message: CONNECTION_SUCCESS_MESSAGE,
              }),
            );
          }),
          catchError((error: unknown) => {
            return [
              WebSerialActions.onConnectFail({
                isConnected: false,
                errorMessage: getConnectionErrorMessage(error),
              }),
            ];
          }),
        ),
      ),
    ),
  );

  disConnect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WebSerialActions.onDisConnect),
        switchMap(() => this.service.disconnect$())
      ),
    { dispatch: false }
  );
}
