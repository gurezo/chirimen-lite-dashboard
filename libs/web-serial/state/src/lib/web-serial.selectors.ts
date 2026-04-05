import { createSelector } from '@ngrx/store';
import { WebSerialState } from './web-serial.model';

export const selectWebSerialFeature = (state: { webSerial: WebSerialState }) =>
  state.webSerial;

export const isConnected = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.isConnected
);

export const selectConnectionMessage = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.connectionMessage
);

export const selectErrorMessage = createSelector(
  selectWebSerialFeature,
  (state: WebSerialState) => state.errorMessage
);
