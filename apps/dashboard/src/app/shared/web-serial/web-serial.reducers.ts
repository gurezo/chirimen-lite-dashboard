import { createReducer, on } from '@ngrx/store';
import { WebSerialActions } from './web-serial.actions';
import { WebSerialState } from './web.serrial.model';

export const initialWebSerialState: WebSerialState = {
  isConnected: false,
  sendData: '',
  receiveData: '',
  error: null,
};

export const webSerialFeatureKey = 'webSerial';

export const webSerialReducer = createReducer(
  initialWebSerialState,
  on(WebSerialActions.init, () => ({
    ...initialWebSerialState,
  })),
  on(WebSerialActions.onConnect, (state) => ({
    ...state,
  })),
  on(WebSerialActions.onConnectSuccess, (state, { isConnected }) => ({
    ...state,
    isConnected,
  })),
  on(WebSerialActions.onConnectFail, (state, { isConnected }) => ({
    ...state,
    isConnected,
  })),
  on(WebSerialActions.onDisConnect, () => ({
    ...initialWebSerialState,
  })),
  on(WebSerialActions.sendData, (state, { sendData }) => ({
    ...state,
    sendData,
  })),
  on(WebSerialActions.receiveData, (state, { receiveData }) => ({
    ...state,
    receiveData,
  })),
  on(WebSerialActions.error, (state, { error }) => ({
    ...state,
    error,
  }))
);
