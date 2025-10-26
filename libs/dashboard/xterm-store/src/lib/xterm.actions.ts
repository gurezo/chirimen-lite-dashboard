import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const XTermActions = createActionGroup({
  source: '[XTerm]',
  events: {
    initializeTerminal: emptyProps(),
    readFromTerminal: props<{ data: string }>(),
    writeToTerminal: props<{ data: string }>(),
    clearTerminal: emptyProps(),
    setConnected: props<{ connected: boolean }>(),
    setError: props<{ error: unknown | null }>(),
  },
});

