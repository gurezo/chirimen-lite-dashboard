export interface WebSerialState {
  isConnected: boolean;
  error: unknown;
  connectionMessage: string; // 接続成功メッセージ
  errorMessage: string; // エラーメッセージ
}
