import {
  arrayBufferToBase64,
  arrayBufferToString,
  base64ToArrayBuffer,
  concatArrayBuffers,
  stringToArrayBuffer,
} from './buffer';

describe('Buffer Utils', () => {
  describe('stringToArrayBuffer', () => {
    it('should convert string to ArrayBuffer', () => {
      const input = 'Hello, World!';
      const result = stringToArrayBuffer(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.byteLength).toBe(13); // "Hello, World!" is 13 characters
    });

    it('should handle empty string', () => {
      const input = '';
      const result = stringToArrayBuffer(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.byteLength).toBe(0);
    });

    it('should handle unicode characters', () => {
      const input = 'こんにちは';
      const result = stringToArrayBuffer(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.byteLength).toBeGreaterThan(0);
    });
  });

  describe('arrayBufferToString', () => {
    it('should convert ArrayBuffer back to string', () => {
      const original = 'Hello, World!';
      const buffer = stringToArrayBuffer(original);
      const result = arrayBufferToString(buffer);

      expect(result).toBe(original);
    });

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToString(buffer);

      expect(result).toBe('');
    });

    it('should handle unicode characters', () => {
      const original = 'こんにちは';
      const buffer = stringToArrayBuffer(original);
      const result = arrayBufferToString(buffer);

      expect(result).toBe(original);
    });
  });

  describe('concatArrayBuffers', () => {
    it('should concatenate multiple ArrayBuffers', () => {
      const buffer1 = stringToArrayBuffer('Hello');
      const buffer2 = stringToArrayBuffer(', ');
      const buffer3 = stringToArrayBuffer('World!');

      const result = concatArrayBuffers([buffer1, buffer2, buffer3]);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(arrayBufferToString(result)).toBe('Hello, World!');
    });

    it('should handle empty array', () => {
      const result = concatArrayBuffers([]);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.byteLength).toBe(0);
    });

    it('should handle single ArrayBuffer', () => {
      const buffer = stringToArrayBuffer('Single');
      const result = concatArrayBuffers([buffer]);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(arrayBufferToString(result)).toBe('Single');
    });

    it('should handle empty ArrayBuffers', () => {
      const buffer1 = new ArrayBuffer(0);
      const buffer2 = stringToArrayBuffer('Hello');
      const buffer3 = new ArrayBuffer(0);

      const result = concatArrayBuffers([buffer1, buffer2, buffer3]);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(arrayBufferToString(result)).toBe('Hello');
    });
  });

  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to base64 string', () => {
      const input = 'Hello, World!';
      const buffer = stringToArrayBuffer(input);
      const result = arrayBufferToBase64(buffer);

      expect(typeof result).toBe('string');
      expect(result).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToBase64(buffer);

      expect(result).toBe('');
    });

    it('should handle binary data', () => {
      const bytes = new Uint8Array([0x00, 0xff, 0x0a, 0x0d]);
      const result = arrayBufferToBase64(bytes.buffer);

      expect(typeof result).toBe('string');
      expect(result).toBe('AP8KDQ==');
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert base64 string back to ArrayBuffer', () => {
      const original = 'Hello, World!';
      const base64 = 'SGVsbG8sIFdvcmxkIQ==';
      const result = base64ToArrayBuffer(base64);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(arrayBufferToString(result)).toBe(original);
    });

    it('should handle empty base64 string', () => {
      const result = base64ToArrayBuffer('');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.byteLength).toBe(0);
    });

    it('should handle binary data', () => {
      const base64 = 'AP8KDQ==';
      const result = base64ToArrayBuffer(base64);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      const bytes = new Uint8Array(result);
      expect(bytes[0]).toBe(0x00);
      expect(bytes[1]).toBe(0xff);
      expect(bytes[2]).toBe(0x0a);
      expect(bytes[3]).toBe(0x0d);
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain data integrity through string conversion', () => {
      const original = 'Test string with special chars: !@#$%^&*()';
      const buffer = stringToArrayBuffer(original);
      const result = arrayBufferToString(buffer);

      expect(result).toBe(original);
    });

    it('should maintain data integrity through base64 conversion', () => {
      const original = 'Test string with special chars: !@#$%^&*()';
      const buffer = stringToArrayBuffer(original);
      const base64 = arrayBufferToBase64(buffer);
      const result = base64ToArrayBuffer(base64);
      const finalString = arrayBufferToString(result);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(finalString).toBe(original);
    });

    it('should handle concatenation with conversion', () => {
      const parts = ['Hello', ' ', 'World', '!'];
      const buffers = parts.map((part) => stringToArrayBuffer(part));
      const concatenated = concatArrayBuffers(buffers);
      const result = arrayBufferToString(concatenated);

      expect(result).toBe('Hello World!');
    });
  });
});
