import { createSelector } from '@ngrx/store';
import { WebSerialState } from './web.serrial.model';

export const selectWebSerialFeature = (state: { webSerial: WebSerialState }) =>
  state.webSerial;

export const isConnected = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.isConnected
);

export const selectSendData = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.sendData
);

export const selectReciveData = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.receiveData
);
