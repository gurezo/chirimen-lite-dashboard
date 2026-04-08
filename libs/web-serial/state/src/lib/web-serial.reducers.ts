import { createReducer, on } from '@ngrx/store';
import { WebSerialActions } from './web-serial.actions';
import { WebSerialState } from './web-serial.model';

export const initialWebSerialState: WebSerialState = {
  isConnected: false,
  error: null,
  connectionMessage: '',
  errorMessage: '',
};

export const webSerialFeatureKey = 'webSerial';

export const webSerialReducer = createReducer(
  initialWebSerialState,
  on(WebSerialActions.onConnect, (state) => ({
    ...state,
  })),
  on(WebSerialActions.onConnectSuccess, (state, { message }) => ({
    ...state,
    isConnected: true,
    connectionMessage: message,
    errorMessage: '',
  })),
  on(WebSerialActions.onConnectFail, (state, { errorMessage }) => ({
    ...state,
    isConnected: false,
    connectionMessage: '',
    errorMessage,
  })),
  on(WebSerialActions.onDisConnect, () => ({
    ...initialWebSerialState,
  })),
  on(WebSerialActions.error, (state, { error }) => ({
    ...state,
    error,
  }))
);
