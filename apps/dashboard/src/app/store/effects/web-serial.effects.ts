import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { Store } from '@ngrx/store';
import { catchError, from, map, switchMap } from 'rxjs';
import { WEB_SERIAL_OPEN_SUCCESS } from '../../constants';
import { ToastMessageService, WebSerialService } from '../../service';
import { WebSerialActions } from '../actions/web-serial.actions';

@Injectable()
export class WebSerialEffects {
  actions$ = inject(Actions);
  service = inject(WebSerialService);
  toastMessage = inject(ToastMessageService);
  // store = inject(Store);

  init$ = createEffect(
    () => this.actions$.pipe(ofType(WebSerialActions.init)),
    { dispatch: false },
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.onConnect),
      switchMap(() =>
        from(this.service.connect()).pipe(
          map((connectedResult) => {
            if (connectedResult === WEB_SERIAL_OPEN_SUCCESS) {
              this.toastMessage.webSerailSuccess();
              return WebSerialActions.onConnectSuccess({ isConnected: true });
            } else {
              this.toastMessage.webSerailError(connectedResult);
              return WebSerialActions.onConnectFail({ isConnected: false });
            }
          }),
        ),
      ),
    ),
  );

  disConnect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WebSerialActions.onDisConnect),
        switchMap(() => from(this.service.disConnect())),
      ),
    { dispatch: false },
  );

  sendData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.sendData),
      switchMap((action) =>
        this.service.sendData(action.sendData).pipe(
          map(() => WebSerialActions.onSendSuccess()),
          catchError(async (error) => WebSerialActions.error(error)),
        ),
      ),
    ),
  );

  receiveData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.receivedData),
      switchMap(() =>
        this.service.readData().pipe(
          map((receivedData) =>
            WebSerialActions.receivedData({ receivedData }),
          ),
          catchError(async (error) => WebSerialActions.error(error)),
        ),
      ),
    ),
  );
}
