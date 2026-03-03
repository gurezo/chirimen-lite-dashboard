/// <reference types="@types/w3c-web-serial" />

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { SerialTransportService } from './serial-transport.service';

const mockGetReadStream = vi.fn();
const mockWrite = vi.fn();
const mockPort = {} as SerialPort;

function createMockClient(overrides: Partial<{
  connect: () => ReturnType<typeof of>;
  currentPort: SerialPort | null;
}> = {}) {
  return {
    connect: () => of(undefined),
    disconnect: () => of(undefined),
    get connected(): boolean {
      return true;
    },
    get currentPort(): SerialPort | null {
      return overrides.currentPort ?? mockPort;
    },
    getReadStream: mockGetReadStream,
    write: mockWrite,
    ...overrides,
  };
}

vi.mock('@gurezo/web-serial-rxjs', () => ({
  createSerialClient: vi.fn(() => createMockClient()),
}));

describe('SerialTransportService', () => {
  let service: SerialTransportService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReadStream.mockReturnValue(of(new Uint8Array([72, 101, 108, 108, 111])));
    mockWrite.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [SerialTransportService],
    });
    service = TestBed.inject(SerialTransportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    it('should return port on success', async () => {
      const result = await service.connect(115200);

      expect(result).toEqual({ port: mockPort });
    });

    it('should return error when connect throws', async () => {
      const { createSerialClient } = await import('@gurezo/web-serial-rxjs');
      vi.mocked(createSerialClient).mockImplementationOnce(() =>
        createMockClient({
          connect: () => throwError(() => new Error('requestPort failed')),
        })
      );

      const result = await service.connect(115200);

      expect(result).toEqual({ error: 'requestPort failed' });
    });
  });

  describe('disconnect', () => {
    it('should clear client when disconnected', async () => {
      await service.connect(115200);
      expect(service.isConnected()).toBe(true);

      await service.disconnect();

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('getReadStream', () => {
    it('should return throwError when not connected', (done) => {
      service.getReadStream().subscribe({
        error: (err) => {
          expect(err.message).toBe('Serial port not connected');
          done();
        },
      });
    });

    it('should return decoded string stream when connected', (done) => {
      service.connect(115200).then(() => {
        service.getReadStream().subscribe({
          next: (value) => {
            expect(value).toBe('Hello');
            done();
          },
        });
      });
    });
  });

  describe('write', () => {
    it('should return throwError when not connected', (done) => {
      service.write('test').subscribe({
        error: (err) => {
          expect(err.message).toBe('Serial port not connected');
          done();
        },
      });
    });

    it('should call client write when connected', (done) => {
      service.connect(115200).then(() => {
        service.write('hello').subscribe({
          next: () => {
            expect(mockWrite).toHaveBeenCalled();
            done();
          },
        });
      });
    });
  });

  describe('isConnected / getPort', () => {
    it('should return false and undefined when not connected', () => {
      expect(service.isConnected()).toBe(false);
      expect(service.getPort()).toBeUndefined();
    });

    it('should return true and port after connect', async () => {
      await service.connect(115200);
      expect(service.isConnected()).toBe(true);
      expect(service.getPort()).toBe(mockPort);
    });
  });
});
