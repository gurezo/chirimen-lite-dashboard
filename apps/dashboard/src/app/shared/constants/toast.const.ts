export const TOAST = {
  SUCCESS: {
    OPEN_TITLE: 'Web Serail Open Success',
    OPEN_MESSAGE: 'Raspberry Pi Zero に正常接続されました。',
  } as const,
  ERROR: {
    FAIL: 'Web Serial Open Fail',
    NOT_FOUND_TITLE: 'Web Serial Open Error',
    NOT_FOUND_MESSAGE:
      '接続されたデバイスは Raspberry Pi Zero ではありません。',
    NO_SELECTED: 'ポートが選択されていません。',
    PORT_ALREADY_OPEN: 'Raspberry Pi Zero が接続されたままです。',
    PORT_OPEN_FAIL: 'Web Serial ポートの接続に失敗しました。',
    UNKNOWN: '原因不明のエラーです。',
  } as const,
} as const;
