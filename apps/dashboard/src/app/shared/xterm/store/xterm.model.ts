export interface XtermState {
  input: string;
  output: string;
  connected: boolean;
  error: unknown | null;
}

export const initialXtermState: XtermState = {
  input: '',
  output: '',
  connected: false,
  error: null,
};
