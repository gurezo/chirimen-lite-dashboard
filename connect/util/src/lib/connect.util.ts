export function ensureSerialSupport(): boolean {
  // TODO: Web Serial API のサポート確認ロジックを実装する。
  return 'serial' in navigator;
}

export function createConnectClient(): never {
  // TODO: Web Serial 接続クライアントの実装を追加する。
  throw new Error('createConnectClient is not implemented yet.');
}

