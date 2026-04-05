/**
 * {@link SerialFacadeService#exec} / execRaw / readUntilPrompt 向けオプション
 */
export interface SerialExecOptions {
  prompt: string | RegExp;
  timeout?: number;
  retry?: number;
}
