import { createReducer, on } from '@ngrx/store';
import { XTermActions } from './xterm.actions';
import { initialXtermState } from './xterm.model';

export const xtermReducer = createReducer(
  initialXtermState,
  on(XTermActions.initializeTerminal, () => initialXtermState),
  on(XTermActions.readFromTerminal, (state, { data }) => ({
    ...state,
    input: state.input + data,
  })),
  on(XTermActions.writeToTerminal, (state, { data }) => ({
    ...state,
    output: state.output + data,
  })),
  on(XTermActions.clearTerminal, (state) => ({
    ...state,
    output: '',
  })),
  on(XTermActions.setConnected, (state, { connected }) => ({
    ...state,
    connected,
  })),
  on(XTermActions.setError, (state, { error }) => ({
    ...state,
    error,
  }))
);
