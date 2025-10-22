import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { Store } from '@ngrx/store';
import { catchError, from, map, switchMap } from 'rxjs';
import { WEB_SERIAL } from '../constants/web.serial.const';
import { SerialFacadeService } from '../services/serial-facade.service';
import { WebSerialActions } from './web-serial.actions';

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
                message: WEB_SERIAL.PORT.SUCCESS.OPEN,
              });
            } else {
              return WebSerialActions.onConnectFail({
                isConnected: false,
                errorMessage: WEB_SERIAL.RASPBERRY_PI.IS_NOT_ZERO,
              });
            }
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
