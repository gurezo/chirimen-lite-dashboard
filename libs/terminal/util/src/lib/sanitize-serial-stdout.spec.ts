import { describe, expect, it } from 'vitest';
import { sanitizeSerialStdout } from './sanitize-serial-stdout';

describe('sanitizeSerialStdout', () => {
  it('removes echoed command and trailing prompt', () => {
    const raw =
      'i2cdetect -y 1\n     0  1  2  3\npi@chirimen:~ $ ';
    const out = sanitizeSerialStdout(raw, 'i2cdetect -y 1', 'pi@chirimen:~ $ ');
    expect(out).toContain('0  1  2  3');
    expect(out).not.toContain('pi@chirimen');
  });
});
