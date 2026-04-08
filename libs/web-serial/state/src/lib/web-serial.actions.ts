import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const WebSerialActions = createActionGroup({
  source: '[Web Serial]',
  events: {
    onConnect: emptyProps(),
    onConnectSuccess: props<{ isConnected: boolean; message: string }>(),
    onConnectFail: props<{ isConnected: boolean; errorMessage: string }>(),
    onDisConnect: emptyProps(),
    error: props<{ error: unknown }>(),
  },
});
