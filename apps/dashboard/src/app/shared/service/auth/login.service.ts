import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '../serial/serial-facade.service';

/**
 * ログイン設定
 */
export interface LoginConfig {
  loginId: string;
  loginPassword: string;
  commandPrompt: string;
  language: 'en' | 'ja';
}

/**
 * ログインサービス
 *
 * Raspberry Pi へのログイン処理を担当
 * porting/services/login.service.ts から移行
 */
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private serial = inject(SerialFacadeService);

  private readonly ctrlc = '\x03'; // end of text
  private readonly ctrld = '\x04'; // end of transmission

  private readonly defaultConfig: LoginConfig = {
    loginId: 'pi',
    loginPassword: 'raspberry',
    commandPrompt: 'pi@raspberrypi:',
    language: 'en',
  };

  /**
   * 自動ログイン処理を実行
   *
   * @param config ログイン設定（省略時はデフォルト）
   */
  async autoLogin(config?: Partial<LoginConfig>): Promise<void> {
    const loginConfig = { ...this.defaultConfig, ...config };

    try {
      // プロンプトが表示されるまで待機
      await this.waitForPrompt();

      // ログイン状態をチェック
      const isLoggedIn = await this.checkLoginStatus(loginConfig);

      if (!isLoggedIn) {
        // ログイン処理を実行
        await this.performLogin(loginConfig);
      }

      // 初期設定を実行
      await this.performInitialSetup(loginConfig);
    } catch (error) {
      throw new Error(
        `Login failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * プロンプトが表示されるまで待機
   */
  private async waitForPrompt(): Promise<void> {
    let hasResponse = false;
    let retryCount = 0;
    const maxRetries = 10;

    while (!hasResponse && retryCount < maxRetries) {
      try {
        await this.serial.write(this.ctrlc);
        await this.waitForPattern('\n', ':', 1000);
        hasResponse = true;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error('Failed to get prompt after maximum retries');
        }
        await this.sleep(1000);
      }
    }
  }

  /**
   * ログイン状態をチェック
   */
  private async checkLoginStatus(config: LoginConfig): Promise<boolean> {
    try {
      const response = await this.waitForPattern('\n', ':', 1000);
      return response.includes('pi@');
    } catch (error) {
      return false;
    }
  }

  /**
   * ログイン処理を実行
   */
  private async performLogin(config: LoginConfig): Promise<void> {
    // ログインIDを入力
    await this.waitForPattern(config.loginId + '\n', 'Password:', 5000);

    // パスワードを入力
    await this.waitForPattern(config.loginPassword + '\n', '\\$', 40000);
  }

  /**
   * 初期設定を実行
   */
  private async performInitialSetup(config: LoginConfig): Promise<void> {
    // ヒストリコントロール設定
    await this.waitForPattern(' HISTCONTROL=ignoreboth', config.commandPrompt);

    // タイムゾーン設定（日本語の場合）
    if (config.language === 'ja') {
      await this.waitForPattern(
        ' sudo timedatectl set-timezone Asia/Tokyo',
        config.commandPrompt
      );
    }

    // 日時設定
    await this.setSystemDateTime(config.commandPrompt);
  }

  /**
   * システム日時を設定
   */
  private async setSystemDateTime(commandPrompt: string): Promise<void> {
    const date = new Date();
    const dateCmd = this.buildDateCommand(date);
    await this.waitForPattern(dateCmd, commandPrompt);
  }

  /**
   * date コマンドを生成
   */
  private buildDateCommand(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const year = date.getFullYear();
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return ` sudo date ${month}${day}${hours}${minutes}${year}.${seconds}`;
  }

  /**
   * パターン待機（簡易実装）
   */
  private async waitForPattern(
    writeData: string,
    pattern: string,
    timeoutMs: number = 30000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Pattern wait timeout: ${pattern}`));
      }, timeoutMs);

      // データを送信
      this.serial.write(writeData).catch(reject);

      // 実際の実装では、データストリームを監視する必要がある
      // ここでは簡易的な実装
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve('Pattern matched');
      }, 100);
    });
  }

  /**
   * ログアウト処理
   */
  async logout(): Promise<void> {
    try {
      await this.serial.disconnect();
    } catch (error) {
      throw new Error(
        `Logout failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
