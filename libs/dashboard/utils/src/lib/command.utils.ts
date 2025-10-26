/**
 * コマンド実行ユーティリティ
 *
 * porting/utils/command-utils.ts からリファクタリング
 * - executeCommand() を削除（Service層に任せる）
 * - parseOutputLines() を削除（ParserUtils に統一）
 * - 残すメソッド: escapePath(), getSudoPrefix()
 */
export class CommandUtils {
  /**
   * ファイルパスをエスケープ
   *
   * @param path エスケープするパス
   * @returns エスケープされたパス
   */
  static escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }

  /**
   * sudo コマンドのプレフィックスを生成
   *
   * @param useSudo sudo を使用するか
   * @returns sudo プレフィックス（使用する場合は 'sudo '、しない場合は ''）
   */
  static getSudoPrefix(useSudo: boolean = false): string {
    return useSudo ? 'sudo ' : '';
  }

  /**
   * コマンドオプションを構築
   *
   * @param options オプションのマップ
   * @returns オプション文字列
   */
  static buildCommandOptions(
    options: Record<string, string | boolean>
  ): string {
    return Object.entries(options)
      .filter(([_, value]) => value !== false)
      .map(([key, value]) => {
        if (value === true) {
          return `--${key}`;
        }
        return `--${key}=${value}`;
      })
      .join(' ');
  }

  /**
   * 環境変数を設定するコマンドを生成
   *
   * @param name 環境変数名
   * @param value 値
   * @returns export コマンド文字列
   */
  static generateExportCommand(name: string, value: string): string {
    return `export ${name}="${value}"`;
  }
}

