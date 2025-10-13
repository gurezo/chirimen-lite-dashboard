export interface WebSerialState {
  isConnected: boolean;
  sendData: string;
  receiveData: string;
  error: unknown;
  connectionMessage: string; // 接続成功メッセージ
  errorMessage: string; // エラーメッセージ
}
