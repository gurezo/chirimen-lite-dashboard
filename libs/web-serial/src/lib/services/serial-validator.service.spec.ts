import { TestBed } from '@angular/core/testing';
import { RASPBERRY_PI_ZERO_INFO } from '../../constants';
import { SerialValidatorService } from './serial-validator.service';

describe('SerialValidatorService', () => {
  let service: SerialValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SerialValidatorService],
    });
    service = TestBed.inject(SerialValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isRaspberryPiZero', () => {
    it('should return true for Raspberry Pi Zero', async () => {
      const mockPort = {
        getInfo: () =>
          Promise.resolve({
            usbVendorId: RASPBERRY_PI_ZERO_INFO.usbVendorId,
            usbProductId: RASPBERRY_PI_ZERO_INFO.usbProductId,
          }),
      } as SerialPort;

      const result = await service.isRaspberryPiZero(mockPort);
      expect(result).toBe(true);
    });

    it('should return false for other devices', async () => {
      const mockPort = {
        getInfo: () =>
          Promise.resolve({
            usbVendorId: 0x9999,
            usbProductId: 0x8888,
          }),
      } as SerialPort;

      const result = await service.isRaspberryPiZero(mockPort);
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const mockPort = {
        getInfo: () => Promise.reject(new Error('Failed to get info')),
      } as SerialPort;

      const result = await service.isRaspberryPiZero(mockPort);
      expect(result).toBe(false);
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device info', async () => {
      const mockPort = {
        getInfo: () =>
          Promise.resolve({
            usbVendorId: 0x1234,
            usbProductId: 0x5678,
          }),
      } as SerialPort;

      const result = await service.getDeviceInfo(mockPort);
      expect(result).toEqual({
        vendorId: 0x1234,
        productId: 0x5678,
      });
    });

    it('should return null on error', async () => {
      const mockPort = {
        getInfo: () => Promise.reject(new Error('Failed to get info')),
      } as SerialPort;

      const result = await service.getDeviceInfo(mockPort);
      expect(result).toBeNull();
    });
  });

  describe('isSupportedDevice', () => {
    it('should return true for Raspberry Pi Zero', async () => {
      const mockPort = {
        getInfo: () =>
          Promise.resolve({
            usbVendorId: RASPBERRY_PI_ZERO_INFO.usbVendorId,
            usbProductId: RASPBERRY_PI_ZERO_INFO.usbProductId,
          }),
      } as SerialPort;

      const result = await service.isSupportedDevice(mockPort);
      expect(result).toBe(true);
    });
  });
});
