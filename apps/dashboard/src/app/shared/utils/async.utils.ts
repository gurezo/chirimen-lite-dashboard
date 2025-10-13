/**
 * 非同期処理ユーティリティ
 *
 * porting/utils/async.ts から移行
 */

/**
 * 指定ミリ秒スリープする
 *
 * @param msec スリープ時間（ミリ秒）
 * @returns Promise
 */
export const sleep = (msec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, msec));

/**
 * リトライ処理
 *
 * @param fn 実行する関数
 * @param retries リトライ回数（デフォルト: 3）
 * @param delay リトライ間隔（ミリ秒、デフォルト: 1000）
 * @returns 関数の実行結果
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay);
  }
};

/**
 * タイムアウト付き Promise
 *
 * @param promise Promise
 * @param ms タイムアウト時間（ミリ秒）
 * @param error タイムアウト時のエラー
 * @returns Promise の結果
 */
export const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  error = new Error('Timeout')
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(error), ms);
    promise.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
};
