/**
 * 日時ユーティリティ
 *
 * porting/utils/date-utils.ts から移行
 */
export class DateUtils {
  /**
   * 2桁のゼロパディング
   *
   * @param input 数値
   * @returns ゼロパディングされた文字列
   */
  static pad2(input: number): string {
    return ('0' + input).slice(-2);
  }

  /**
   * 日付コマンドを構築（MMDDHHMMYYYY.SS形式）
   *
   * @param date 日付
   * @returns date コマンド文字列
   */
  static buildDateCommand(date: Date): string {
    const month = this.pad2(date.getMonth() + 1);
    const day = this.pad2(date.getDate());
    const hours = this.pad2(date.getHours());
    const minutes = this.pad2(date.getMinutes());
    const seconds = this.pad2(date.getSeconds());

    return `sudo date ${month}${day}${hours}${minutes}${date.getFullYear()}.${seconds}`;
  }

  /**
   * 現在の日時を取得
   *
   * @returns 現在の Date オブジェクト
   */
  static getCurrentDateTime(): Date {
    return new Date();
  }

  /**
   * タイムゾーン設定コマンドを生成
   *
   * @param timezone タイムゾーン（デフォルト: 'Asia/Tokyo'）
   * @returns timedatectl コマンド文字列
   */
  static generateTimezoneCommand(timezone: string = 'Asia/Tokyo'): string {
    return `sudo timedatectl set-timezone ${timezone}`;
  }

  /**
   * ヒストリコントロール設定コマンドを生成
   *
   * @returns HISTCONTROL コマンド文字列
   */
  static generateHistoryControlCommand(): string {
    return 'HISTCONTROL=ignoreboth';
  }

  /**
   * Unix タイムスタンプを Date に変換
   *
   * @param timestamp Unix タイムスタンプ（秒）
   * @returns Date オブジェクト
   */
  static fromUnixTimestamp(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  /**
   * Date を Unix タイムスタンプに変換
   *
   * @param date Date オブジェクト
   * @returns Unix タイムスタンプ（秒）
   */
  static toUnixTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}

