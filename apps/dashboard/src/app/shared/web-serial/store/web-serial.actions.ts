import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const WebSerialActions = createActionGroup({
  source: '[Web Serial]',
  events: {
    init: emptyProps(),
    onConnect: emptyProps(),
    onConnectSuccess: props<{ isConnected: boolean; message: string }>(),
    onConnectFail: props<{ isConnected: boolean; errorMessage: string }>(),
    onDisConnect: emptyProps(),
    sendData: props<{ sendData: string }>(),
    onSendSuccess: emptyProps(),
    onSendFail: emptyProps(),
    receiveData: props<{ receiveData: string }>(),
    error: props<{ error: unknown }>(),
  },
});
