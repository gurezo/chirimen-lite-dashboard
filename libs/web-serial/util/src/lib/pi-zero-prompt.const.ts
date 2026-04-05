export const PI_ZERO_PROMPT = 'pi@raspberrypi:' as const;

/**
 * シリアルコンソールの pi ユーザーシェルプロンプト先頭（`pi@<hostname>:`）。
 * 固定文字列 {@link PI_ZERO_PROMPT} だけでは Chirimen 等でホスト名が異なりログイン完了を検出できない。
 */
export const PI_ZERO_SHELL_PROMPT_LINE_PATTERN = /pi@[^:\r\n]+:/;

