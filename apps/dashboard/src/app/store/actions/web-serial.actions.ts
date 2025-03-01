import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const WebSerialActions = createActionGroup({
  source: '[Web Searial]',
  events: {
    init: emptyProps(),
    onConnect: emptyProps(),
    onConnectSuccess: props<{ isConnected: boolean }>(),
    onConnectFail: props<{ isConnected: boolean }>(),
    onDisConnect: emptyProps(),
    sendData: props<{ sendData: string }>(),
    onSendSuccess: emptyProps(),
    onSendFail: emptyProps(),
    receivedData: props<{ receivedData: string }>(),
    error: props<{ error: unknown }>(),
  },
});
