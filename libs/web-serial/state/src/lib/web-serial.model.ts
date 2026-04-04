export interface WebSerialState {
  isConnected: boolean;
  /** `initializeAfterConnect`（プロンプト待ち・初期コマンド）が完了したら true */
  isPostConnectInitDone: boolean;
  sendData: string;
  receiveData: string;
  error: unknown;
  connectionMessage: string; // 接続成功メッセージ
  errorMessage: string; // エラーメッセージ
}
