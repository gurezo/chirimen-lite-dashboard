import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { Store } from '@ngrx/store';
import { catchError, from, map, switchMap } from 'rxjs';
import { WEB_SERIAL } from '../../constants';
import { ToastMessageService } from '../../service';
import { WebSerialService } from '../service/web-serial.service';
import { WebSerialActions } from './web-serial.actions';

@Injectable()
export class WebSerialEffects {
  actions$ = inject(Actions);
  service = inject(WebSerialService);
  toastMessage = inject(ToastMessageService);
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
          map((connectedResult) => {
            if (connectedResult === WEB_SERIAL.PORT.SUCCESS.OPEN) {
              this.toastMessage.webSerailSuccess();
              return WebSerialActions.onConnectSuccess({ isConnected: true });
            } else {
              this.toastMessage.webSerailError(connectedResult);
              return WebSerialActions.onConnectFail({ isConnected: false });
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
        switchMap(() => from(this.service.disConnect()))
      ),
    { dispatch: false }
  );

  sendData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.sendData),
      switchMap((action) =>
        from(this.service.send(action.sendData)).pipe(
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
