import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const WebSerialActions = createActionGroup({
  source: '[Web Serial]',
  events: {
    onConnect: emptyProps(),
    onConnectSuccess: props<{ message: string }>(),
    onConnectFail: props<{ errorMessage: string }>(),
    onDisConnect: emptyProps(),
    error: props<{ error: unknown }>(),
  },
});
