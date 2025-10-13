import { TestBed } from '@angular/core/testing';
import { WiFiInfo } from '../types';
import { FileUtils, ParserUtils, WiFiUtils } from '../utils';
import { WiFiError } from '../utils/serial.errors';
import { FileService } from './file.service';
import { SerialService } from './serial.service';
import { WiFiService } from './wifi.service';

// SerialServiceとFileServiceのモック
jest.mock('./serial.service');
jest.mock('./file.service');

describe('WiFiService', () => {
  let service: WiFiService;
  let mockSerialService: jest.Mocked<SerialService>;
  let mockFileService: jest.Mocked<FileService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WiFiService,
        {
          provide: SerialService,
          useValue: {
            portWritelnWaitfor: jest.fn(),
            terminateConnection: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            saveFile: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(WiFiService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
    mockFileService = TestBed.inject(FileService) as jest.Mocked<FileService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('wifiStat', () => {
    it('should get WiFi status successfully', async () => {
      const mockIfconfigOutput = 'wlan0: inet 192.168.1.100';
      const mockIwconfigOutput = 'wlan0 IEEE 802.11 ESSID:"MyWiFi"';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce(mockIfconfigOutput)
        .mockResolvedValueOnce(mockIwconfigOutput);

      // ParserUtilsをモック
      jest.spyOn(ParserUtils, 'parseIfconfigOutput').mockReturnValue({
        ipInfo: 'wlan0: inet 192.168.1.100',
        ipaddr: 'inet 192.168.1.100',
      });
      jest
        .spyOn(ParserUtils, 'parseIwconfigOutput')
        .mockReturnValue('wlan0 IEEE 802.11 ESSID:"MyWiFi"');

      const result = await service.wifiStat();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'ifconfig',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'iwconfig',
        'EOL'
      );
      expect(result).toEqual({
        ipInfo: 'wlan0: inet 192.168.1.100',
        wlInfo: 'wlan0 IEEE 802.11 ESSID:"MyWiFi"',
        ipaddr: 'inet 192.168.1.100',
      });
    });

    it('should throw WiFiError when ifconfig fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Command failed')
      );

      await expect(service.wifiStat()).rejects.toThrow(WiFiError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'ifconfig',
        'EOL'
      );
    });

    it('should throw WiFiError when iwconfig fails', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('wlan0: inet 192.168.1.100')
        .mockRejectedValueOnce(new Error('Command failed'));

      await expect(service.wifiStat()).rejects.toThrow(WiFiError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'iwconfig',
        'EOL'
      );
    });
  });

  describe('wifiScan', () => {
    it('should scan WiFi networks successfully', async () => {
      const mockOutput = `wlan0     Scan completed :
          Cell 01 - Address: 00:11:22:33:44:55
                    ESSID:"MyWiFi"
                    Protocol:IEEE 802.11n`;

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      // ParserUtilsをモック
      const mockWifiInfos: WiFiInfo[] = [
        {
          address: '00:11:22:33:44:55',
          essid: 'MyWiFi',
          spec: 'IEEE 802.11n',
          quality: '70/70',
          frequency: '2.412 GHz',
          channel: '1',
        },
      ];
      jest
        .spyOn(ParserUtils, 'parseIwlistOutput')
        .mockReturnValue(mockWifiInfos);

      const result = await service.wifiScan();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo iwlist wlan0 scan',
        'EOL'
      );
      expect(result.rawData).toEqual(mockOutput.split('\n'));
      expect(result.wifiInfos).toEqual(mockWifiInfos);
    });

    it('should throw WiFiError when scan fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Scan failed')
      );

      await expect(service.wifiScan()).rejects.toThrow(WiFiError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo iwlist wlan0 scan',
        'EOL'
      );
    });
  });

  describe('setWiFi', () => {
    it('should set WiFi configuration successfully', async () => {
      const ssid = 'MyWiFi';
      const pass = 'mypassword';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // sudo touch /boot/ssh
        .mockResolvedValueOnce(''); // chmod +x wifi_setup.sh && ./wifi_setup.sh

      mockFileService.saveFile.mockResolvedValue();

      await service.setWiFi(ssid, pass);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo touch /boot/ssh',
        'EOL'
      );
      expect(mockFileService.saveFile).toHaveBeenCalled();
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chmod +x wifi_setup.sh && ./wifi_setup.sh "${ssid}" "${pass}"`,
        'EOL'
      );
    });

    it('should throw WiFiError when setWiFi fails', async () => {
      const ssid = 'MyWiFi';
      const pass = 'mypassword';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Setup failed')
      );

      await expect(service.setWiFi(ssid, pass)).rejects.toThrow(WiFiError);
    });
  });

  describe('reboot', () => {
    it('should reboot successfully', async () => {
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      mockSerialService.terminateConnection.mockResolvedValue();

      await service.reboot();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo reboot',
        'EOL'
      );
      expect(mockSerialService.terminateConnection).toHaveBeenCalled();
    });

    it('should throw WiFiError when reboot fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Reboot failed')
      );

      await expect(service.reboot()).rejects.toThrow(WiFiError);
    });
  });

  describe('configureWifi', () => {
    it('should configure WiFi successfully', async () => {
      const ssid = 'MyWiFi';
      const password = 'mypassword';

      // WiFiUtilsをモック
      const mockConfigContent =
        'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev';
      jest
        .spyOn(WiFiUtils, 'generateWpaSupplicantConfig')
        .mockReturnValue(mockConfigContent);

      // プライベートメソッドをモック
      jest.spyOn(service as any, 'saveWifiConfig').mockResolvedValue(undefined);
      jest
        .spyOn(service as any, 'restartWifiService')
        .mockResolvedValue(undefined);

      await service.configureWifi(ssid, password);

      expect(WiFiUtils.generateWpaSupplicantConfig).toHaveBeenCalledWith(
        ssid,
        password
      );
      expect((service as any).saveWifiConfig).toHaveBeenCalledWith(
        mockConfigContent
      );
      expect((service as any).restartWifiService).toHaveBeenCalled();
    });

    it('should throw WiFiError when configuration fails', async () => {
      const ssid = 'MyWiFi';
      const password = 'mypassword';

      jest
        .spyOn(WiFiUtils, 'generateWpaSupplicantConfig')
        .mockReturnValue('config');
      jest
        .spyOn(service as any, 'saveWifiConfig')
        .mockRejectedValue(new Error('Save failed'));

      await expect(service.configureWifi(ssid, password)).rejects.toThrow(
        WiFiError
      );
    });
  });

  describe('saveWifiConfig (private method)', () => {
    it('should save WiFi config successfully', async () => {
      const configContent =
        'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev';
      const mockBase64 = 'Y29uZmln';

      // FileUtilsをモック
      jest.spyOn(FileUtils, 'arrayBufferToBase64').mockReturnValue(mockBase64);
      jest.spyOn(FileUtils, 'prepareForFileOperation').mockResolvedValue();
      jest.spyOn(FileUtils, 'finalizeFileOperation').mockResolvedValue();

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // backup
        .mockResolvedValueOnce('') // tee
        .mockResolvedValueOnce(''); // base64

      await (service as any).saveWifiConfig(configContent);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup',
        'pi@raspberrypi:',
        10000
      );
      expect(FileUtils.prepareForFileOperation).toHaveBeenCalledWith(
        mockSerialService
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null',
        '\n',
        10000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        mockBase64,
        '\n',
        1000
      );
      expect(FileUtils.finalizeFileOperation).toHaveBeenCalledWith(
        mockSerialService
      );
    });

    it('should throw WiFiError when save fails', async () => {
      const configContent = 'config';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Save failed')
      );

      await expect(
        (service as any).saveWifiConfig(configContent)
      ).rejects.toThrow(WiFiError);
    });
  });

  describe('restartWifiService (private method)', () => {
    it('should restart WiFi service successfully', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // restart wpa_supplicant
        .mockResolvedValueOnce(''); // restart networking

      await (service as any).restartWifiService();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo systemctl restart wpa_supplicant',
        'pi@raspberrypi:',
        10000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo systemctl restart networking',
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw WiFiError when restart fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Restart failed')
      );

      await expect((service as any).restartWifiService()).rejects.toThrow(
        WiFiError
      );
    });
  });

  describe('getWifiStatus', () => {
    it('should get WiFi status successfully', async () => {
      const mockResult = 'wlan0 IEEE 802.11 ESSID:"MyWiFi"';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getWifiStatus();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'iwconfig wlan0',
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe(mockResult);
    });

    it('should throw WiFiError when getWifiStatus fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Status failed')
      );

      await expect(service.getWifiStatus()).rejects.toThrow(WiFiError);
    });
  });

  describe('enableWifi', () => {
    it('should enable WiFi successfully', async () => {
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.enableWifi();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo ifconfig wlan0 up',
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw WiFiError when enableWifi fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Enable failed')
      );

      await expect(service.enableWifi()).rejects.toThrow(WiFiError);
    });
  });

  describe('disableWifi', () => {
    it('should disable WiFi successfully', async () => {
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.disableWifi();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo ifconfig wlan0 down',
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw WiFiError when disableWifi fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Disable failed')
      );

      await expect(service.disableWifi()).rejects.toThrow(WiFiError);
    });
  });

  describe('getIpAddress', () => {
    it('should get IP address successfully', async () => {
      const mockResult = '192.168.1.100 192.168.1.101';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getIpAddress();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'hostname -I',
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('192.168.1.100');
    });

    it('should return empty string when no IP address', async () => {
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.getIpAddress();

      expect(result).toBe('');
    });

    it('should throw WiFiError when getIpAddress fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('IP failed')
      );

      await expect(service.getIpAddress()).rejects.toThrow(WiFiError);
    });
  });

  describe('showNetworkConfig', () => {
    it('should show network config successfully', async () => {
      const mockResult = 'auto lo\niface lo inet loopback';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.showNetworkConfig();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cat /etc/network/interfaces',
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe(mockResult);
    });

    it('should throw WiFiError when showNetworkConfig fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Config failed')
      );

      await expect(service.showNetworkConfig()).rejects.toThrow(WiFiError);
    });
  });

  describe('integration tests', () => {
    it('should handle complete WiFi setup workflow', async () => {
      const ssid = 'MyWiFi';
      const password = 'mypassword';

      // 各ステップをモック
      jest
        .spyOn(WiFiUtils, 'generateWpaSupplicantConfig')
        .mockReturnValue('config');
      jest.spyOn(service as any, 'saveWifiConfig').mockResolvedValue(undefined);
      jest
        .spyOn(service as any, 'restartWifiService')
        .mockResolvedValue(undefined);

      // WiFi設定を実行
      await service.configureWifi(ssid, password);

      // 各メソッドが呼ばれたことを確認
      expect(WiFiUtils.generateWpaSupplicantConfig).toHaveBeenCalledWith(
        ssid,
        password
      );
      expect((service as any).saveWifiConfig).toHaveBeenCalledWith('config');
      expect((service as any).restartWifiService).toHaveBeenCalled();
    });

    it('should handle WiFi status and scan workflow', async () => {
      // WiFiステータスを取得
      const mockStatus = 'wlan0 IEEE 802.11 ESSID:"MyWiFi"';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockStatus);

      const status = await service.getWifiStatus();
      expect(status).toBe(mockStatus);

      // WiFiスキャンを実行
      const mockScanOutput = 'wlan0 Scan completed :';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockScanOutput);

      jest.spyOn(ParserUtils, 'parseIwlistOutput').mockReturnValue([]);

      const scanResult = await service.wifiScan();
      expect(scanResult.rawData).toEqual(mockScanOutput.split('\n'));
    });
  });
});
