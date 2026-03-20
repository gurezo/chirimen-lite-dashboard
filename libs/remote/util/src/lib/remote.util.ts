export function formatRemoteStatus(output: string): string {
  // forever list --plain の出力を、行単位で整形して返します。
  // 具体的なフォーマットは環境依存のため、ここでは概略整形のみ行います。
  return output
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

