import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs';
import { XTermActions } from './xterm.actions';

@Injectable()
export class XTermEffects {
  actions$ = inject(Actions);

  init$ = createEffect(
    () => this.actions$.pipe(ofType(XTermActions.initializeTerminal)),
    {
      dispatch: false,
    }
  );

  read$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XTermActions.readFromTerminal),
      map((data) => XTermActions.readFromTerminal(data))
    )
  );

  write$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XTermActions.writeToTerminal),
      map((data) => XTermActions.readFromTerminal(data))
    )
  );

  connected$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XTermActions.setConnected),
      map((connected) => XTermActions.setConnected(connected))
    )
  );

  error$ = createEffect(() =>
    this.actions$.pipe(
      ofType(XTermActions.setError),
      map((error) => XTermActions.setError(error))
    )
  );

  clear$ = createEffect(
    () => this.actions$.pipe(ofType(XTermActions.clearTerminal)),
    {
      dispatch: false,
    }
  );
}
