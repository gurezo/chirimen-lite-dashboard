/**
 * 文字列操作ユーティリティ
 *
 * porting/utils/string.ts から移行
 */

/**
 * 制御文字を削除
 *
 * @param str 文字列
 * @returns 制御文字を削除した文字列
 */
export const removeControlChars = (str: string): string => {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};

/**
 * パスをエスケープ
 *
 * @param path エスケープするパス
 * @returns エスケープされたパス
 */
export const escapePath = (path: string): string => {
  const jsonString = JSON.stringify(String(path));
  return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
};

/**
 * コマンド出力を解析
 *
 * @param output コマンド出力
 * @returns 行の配列（空行を除く）
 */
export const parseCommandOutput = (output: string): string[] => {
  return output.split('\n').filter((line) => line.trim() !== '');
};

/**
 * IP アドレスを抽出
 *
 * @param line テキスト行
 * @returns IP アドレス（見つからない場合は undefined）
 */
export const extractIpAddress = (line: string): string | undefined => {
  const match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[1] : undefined;
};

/**
 * 文字列をトリミング（改行、空白を削除）
 *
 * @param str 文字列
 * @returns トリミングされた文字列
 */
export const trimAll = (str: string): string => {
  return str.replace(/^\s+|\s+$/g, '');
};

/**
 * 複数行の文字列を配列に分割
 *
 * @param str 文字列
 * @returns 行の配列
 */
export const splitLines = (str: string): string[] => {
  return str.split(/\r?\n/);
};
