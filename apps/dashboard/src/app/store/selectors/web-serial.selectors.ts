import { createSelector } from '@ngrx/store';
import { WebSerialState } from '../models';

export const selectWebSerialFeature = (state: { webSerial: WebSerialState }) =>
  state.webSerial;

export const isConnected = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.isConnected,
);

export const selectSendData = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.sendData,
);

export const selectReciveData = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.receivedData,
);
