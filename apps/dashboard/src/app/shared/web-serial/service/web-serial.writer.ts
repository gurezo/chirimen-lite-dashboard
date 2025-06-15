/// <reference types="@types/w3c-web-serial" />

export class WebSerialWriter {
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private writableStreamClosed: Promise<void> | null = null;

  constructor(private port: SerialPort) {}

  async write(data: string): Promise<void> {
    const encoder = new TextEncoderStream();
    try {
      this.writableStreamClosed = encoder.readable.pipeTo(this.port.writable!);
      this.writer = encoder.writable.getWriter();
      await this.writer.write(data);
    } catch (err) {
      console.error('Write error:', err);
    } finally {
      try {
        this.writer?.releaseLock();
        await this.writableStreamClosed?.catch((err) => {
          console.error('Writable stream closed with error:', err);
        });
      } catch (e) {
        console.error('Cleanup error (writer):', e);
      }
    }
  }
}
