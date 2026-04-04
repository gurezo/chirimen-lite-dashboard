import { createReducer, on } from '@ngrx/store';
import { WebSerialActions } from './web-serial.actions';
import { WebSerialState } from './web-serial.model';

export const initialWebSerialState: WebSerialState = {
  isConnected: false,
  isPostConnectInitDone: false,
  sendData: '',
  receiveData: '',
  error: null,
  connectionMessage: '',
  errorMessage: '',
};

export const webSerialFeatureKey = 'webSerial';

export const webSerialReducer = createReducer(
  initialWebSerialState,
  on(WebSerialActions.init, () => ({
    ...initialWebSerialState,
  })),
  on(WebSerialActions.onConnect, (state) => ({
    ...state,
    isPostConnectInitDone: false,
  })),
  on(WebSerialActions.onConnectSuccess, (state, { isConnected, message }) => ({
    ...state,
    isConnected,
    isPostConnectInitDone: false,
    connectionMessage: message,
    errorMessage: '',
  })),
  on(
    WebSerialActions.onConnectFail,
    (state, { isConnected, errorMessage }) => ({
      ...state,
      isConnected,
      isPostConnectInitDone: false,
      connectionMessage: '',
      errorMessage,
    })
  ),
  on(WebSerialActions.postConnectInitComplete, (state) =>
    state.isConnected
      ? { ...state, isPostConnectInitDone: true }
      : state
  ),
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
