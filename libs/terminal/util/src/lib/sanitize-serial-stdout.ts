/**
 * Strip echoed command and trailing remote prompt from serial exec capture.
 */
export function sanitizeSerialStdout(
  stdout: string,
  command: string,
  prompt: string,
): string {
  let out = stdout;

  const cmdIdx = out.indexOf(command);
  if (cmdIdx >= 0) {
    out = out.slice(cmdIdx + command.length);
  }

  const promptIdx = out.lastIndexOf(prompt);
  if (promptIdx >= 0) {
    out = out.slice(0, promptIdx);
  }

  return out.replace(/^[\r\n]+/, '');
}
