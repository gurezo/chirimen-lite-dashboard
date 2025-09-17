/// <reference types="@types/w3c-web-serial" />

export class WebSerialReader {
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private readableStreamClosed: Promise<void> | null = null;

  constructor(private port: SerialPort) {}

  async start(): Promise<string> {
    const decoder = new TextDecoderStream();
    let result = '';
    try {
      this.readableStreamClosed =
        this.port.readable?.pipeTo(
          decoder.writable as WritableStream<Uint8Array>
        ) ?? null;
      const inputStream = decoder.readable;
      this.reader = inputStream.getReader();

      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) result += value;
      }
    } catch (err) {
      console.error('Read error:', err);
    } finally {
      try {
        this.reader?.releaseLock();
        await this.readableStreamClosed?.catch((err) => {
          console.error('Readable stream closed with error:', err);
        });
      } catch (e) {
        console.error('Cleanup error (reader):', e);
      }
    }
    return result;
  }

  stop(): void {
    this.reader
      ?.cancel()
      .catch((err) => console.error('Reader cancel error:', err));
  }
}
