import { createSelector } from '@ngrx/store';
import { WebSerialState } from './web-serial.model';

export const selectWebSerialFeature = (state: { webSerial: WebSerialState }) =>
  state.webSerial;

export const isConnected = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.isConnected
);

export const selectIsPostConnectInitDone = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.isPostConnectInitDone
);

export const selectSendData = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.sendData
);

export const selectReciveData = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.receiveData
);

export const selectConnectionMessage = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.connectionMessage
);

export const selectErrorMessage = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.errorMessage
);
