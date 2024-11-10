import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs';
import { WebSerialService } from '../../service';
import { WebSerialActions } from '../actions/web-serial.actions';

@Injectable()
export class WebSerialEffects {
  actions$ = inject(Actions);
  service = inject(WebSerialService);

  init$ = createEffect(
    () => this.actions$.pipe(ofType(WebSerialActions.init)),
    { dispatch: false },
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSerialActions.onConnect),
      switchMap(() =>
        this.service
          .requestPort()
          .then(() => WebSerialActions.onConnectSuccess({ isConnected: true }))
          .catch(() => WebSerialActions.onConnectFail({ isConnected: false })),
      ),
    ),
  );

  // isConnect$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(WebSerialActions.connect),
  //     // TODO: ここでシリアルポートのリクエストを行う
  //     //  exhaustMap(() => from(this.service.requestPort()).pipe(
  //     //   map(() => of())
  //     // ))),
  //     // map(() => from(this.service.requestPort())),
  //     //  { dispatch: false },
  //     // switchMap(() => {
  //     //   return this.service.requestPort().then(
  //     //     () => {},
  //     //     error((error) => console.error(error))
  //     //   );
  //     // })
  //   ),
  // );
}
