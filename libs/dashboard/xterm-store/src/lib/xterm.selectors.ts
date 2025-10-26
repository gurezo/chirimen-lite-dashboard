import { createSelector } from '@ngrx/store';
import { XtermState } from './xterm.model';

export const xtermFeatureKey = 'xterm';

export const selectXTermFeature = (state: { xterm: XtermState }) => state.xterm;

export const selectInput = createSelector(
  selectXTermFeature,
  (state) => state.input
);
export const selectOutput = createSelector(
  selectXTermFeature,
  (state) => state.output
);
export const selectConnectionStatus = createSelector(
  selectXTermFeature,
  (state) => state.connected
);
export const selectError = createSelector(
  selectXTermFeature,
  (state) => state.error
);

