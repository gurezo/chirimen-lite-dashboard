import { TestBed } from '@angular/core/testing';
import { FileInfo } from '../types';
import { ChirimenService } from './chirimen.service';
import { FileService } from './file.service';
import { SerialService } from './serial.service';

// SerialServiceとFileServiceのモック
jest.mock('./serial.service');
jest.mock('./file.service');

describe('ChirimenService', () => {
  let service: ChirimenService;
  let mockSerialService: jest.Mocked<SerialService>;
  let mockFileService: jest.Mocked<FileService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChirimenService,
        {
          provide: SerialService,
          useValue: {
            portWritelnWaitfor: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            showDir: jest.fn(),
            listAll: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(ChirimenService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
    mockFileService = TestBed.inject(FileService) as jest.Mocked<FileService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setupChirimen', () => {
    it('should setup Chirimen when Node.js is not installed', async () => {
      const nodeVersion = 'v22.9.0';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('-bash: node: command not found') // node -v (not found)
        .mockResolvedValueOnce('') // mkdir chirimenSetup
        .mockResolvedValueOnce('') // cd chirimenSetup
        .mockResolvedValueOnce('') // VERSION=v22.9.0
        .mockResolvedValueOnce('') // DISTRO=linux-armv6l
        .mockResolvedValueOnce('') // wget node.js
        .mockResolvedValueOnce('') // sudo mkdir -p /usr/local/lib/nodejs
        .mockResolvedValueOnce('') // sudo tar -xJvf
        .mockResolvedValueOnce('') // echo to ~/.profile
        .mockResolvedValueOnce('') // . ~/.profile
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('v22.9.0') // node -v (after install)
        .mockResolvedValueOnce('10.0.0') // npm -v
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_camera 0
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_legacy 0
        .mockResolvedValueOnce('/usr/bin/forever') // which forever
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // cd ~/myApp
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce(''); // cd

      mockFileService.showDir.mockResolvedValue();

      const result = await service.setupChirimen();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'node -v',
        'EOL',
        20000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'mkdir chirimenSetup',
        'EOL'
      );
      expect(result).toContain('CONGRATURATIONS. setup completed!');
      expect(result).toContain('CONGRATURATIONS. setup completed!');
    });

    it('should setup Chirimen when Node.js is already installed', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('v18.0.0') // node -v (already installed)
        .mockResolvedValueOnce('8.0.0') // npm -v
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_camera 0
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_legacy 0
        .mockResolvedValueOnce('/usr/bin/forever') // which forever
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // cd ~/myApp
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce(''); // cd

      mockFileService.showDir.mockResolvedValue();

      const result = await service.setupChirimen();

      expect(result).toContain('CONGRATURATIONS. setup completed!');
    });

    it('should install forever when not available', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('v18.0.0') // node -v
        .mockResolvedValueOnce('8.0.0') // npm -v
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_camera 0
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_legacy 0
        .mockResolvedValueOnce('command not found') // which forever
        .mockResolvedValueOnce('') // sudo npm install -g forever
        .mockResolvedValueOnce('') // mkdir ~/myApp
        .mockResolvedValueOnce('') // cd ~/myApp
        .mockResolvedValueOnce('') // wget package.json
        .mockResolvedValueOnce('') // wget RelayServer.js
        .mockResolvedValueOnce('') // npm install
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce(''); // cd final

      mockFileService.showDir.mockResolvedValue();

      const result = await service.setupChirimen();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo npm install -g forever',
        'EOL',
        300000
      );
      expect(result).toContain('CONGRATURATIONS. setup completed!');
    });

    it('should handle camera and legacy configuration', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('v18.0.0') // node -v
        .mockResolvedValueOnce('8.0.0') // npm -v
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_camera 0
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_legacy 0
        .mockResolvedValueOnce('/usr/bin/forever') // which forever
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // cd ~/myApp
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce(''); // cd

      mockFileService.showDir.mockResolvedValue();

      await service.setupChirimen();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo raspi-config nonint do_camera 0',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'sudo raspi-config nonint do_legacy 0',
        'EOL'
      );
    });

    it('should build Chirimen development directory', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('v18.0.0') // node -v
        .mockResolvedValueOnce('8.0.0') // npm -v
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_camera 0
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_legacy 0
        .mockResolvedValueOnce('/usr/bin/forever') // which forever
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // cd ~/myApp
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce(''); // cd

      mockFileService.showDir.mockResolvedValue();

      await service.setupChirimen();

      // buildChirimenDevDirの呼び出しを確認
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'mkdir ~/myApp',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd ~/myApp',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
        'EOL',
        20000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
        'EOL',
        20000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'npm install',
        'EOL',
        500000
      );
    });
  });

  describe('buildChirimenDevDir (private method)', () => {
    it('should build development directory with default path', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // mkdir
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // wget package.json
        .mockResolvedValueOnce('') // wget RelayServer.js
        .mockResolvedValueOnce(''); // npm install

      await (service as any).buildChirimenDevDir();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'mkdir ~/myApp',
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd ~/myApp',
        'EOL'
      );
    });

    it('should build development directory with custom path', async () => {
      const customPath = '/custom/path';
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // mkdir
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // wget package.json
        .mockResolvedValueOnce('') // wget RelayServer.js
        .mockResolvedValueOnce(''); // npm install

      await (service as any).buildChirimenDevDir(customPath);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mkdir ${customPath}`,
        'EOL'
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cd ${customPath}`,
        'EOL'
      );
    });

    it('should download required files and install dependencies', async () => {
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // mkdir
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('') // wget package.json
        .mockResolvedValueOnce('') // wget RelayServer.js
        .mockResolvedValueOnce(''); // npm install

      await (service as any).buildChirimenDevDir();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
        'EOL',
        20000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
        'EOL',
        20000
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'npm install',
        'EOL',
        500000
      );
    });
  });

  describe('i2cdetect', () => {
    it('should detect I2C devices successfully', async () => {
      const mockOutput =
        '     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f\n00:          -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      const result = await service.i2cdetect();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'i2cdetect -y 1',
        'EOL'
      );
      expect(result).toContain('<pre><code>');
      expect(result).toContain('</pre></code>');
      expect(result).toContain('<pre><code>');
    });

    it('should handle empty I2C output', async () => {
      const mockOutput = '';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      const result = await service.i2cdetect();

      expect(result).toBe('<pre><code>     </pre></code>');
    });

    it('should format I2C output correctly', async () => {
      const mockOutput = 'Header\nLine1\nLine2\nFooter';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      const result = await service.i2cdetect();

      expect(result).toContain('<pre><code>');
      expect(result).toContain('<pre><code>');
      expect(result).toContain('</pre></code>');
    });
  });

  describe('getJsApps', () => {
    it('should get JavaScript applications successfully', async () => {
      const mockFiles: FileInfo[] = [
        { name: 'app1.js', size: 1024, isDirectory: false },
        { name: 'app2.js', size: 2048, isDirectory: false },
        { name: 'config.txt', size: 512, isDirectory: false },
        { name: 'app3.js', size: 1536, isDirectory: false },
      ];

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      mockFileService.showDir.mockResolvedValue();
      mockFileService.listAll.mockResolvedValue({ files: mockFiles });

      const result = await service.getJsApps();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd /home/pi/myApp/',
        'EOL'
      );
      expect(mockFileService.showDir).toHaveBeenCalled();
      expect(mockFileService.listAll).toHaveBeenCalled();
      expect(result).toEqual(['app1.js', 'app2.js', 'app3.js']);
    });

    it('should return empty array when no JavaScript files exist', async () => {
      const mockFiles: FileInfo[] = [
        { name: 'config.txt', size: 512, isDirectory: false },
        { name: 'data.json', size: 1024, isDirectory: false },
      ];

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      mockFileService.showDir.mockResolvedValue();
      mockFileService.listAll.mockResolvedValue({ files: mockFiles });

      const result = await service.getJsApps();

      expect(result).toEqual([]);
    });

    it('should filter only JavaScript files', async () => {
      const mockFiles: FileInfo[] = [
        { name: 'app.js', size: 1024, isDirectory: false },
        { name: 'script.js', size: 2048, isDirectory: false },
        { name: 'app.min.js', size: 1536, isDirectory: false },
        { name: 'app.js.bak', size: 512, isDirectory: false },
      ];

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      mockFileService.showDir.mockResolvedValue();
      mockFileService.listAll.mockResolvedValue({ files: mockFiles });

      const result = await service.getJsApps();

      expect(result).toEqual(['app.js', 'script.js', 'app.min.js']);
    });
  });

  describe('stopAllForeverApp', () => {
    it('should stop all forever applications', async () => {
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.stopAllForeverApp();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'forever stopall',
        'EOL',
        20000
      );
    });
  });

  describe('setForeverApp', () => {
    it('should start forever application with watch mode', async () => {
      const appName = 'myapp.js';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.setForeverApp(appName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `forever start -w ${appName}`,
        'EOL',
        20000
      );
    });

    it('should handle different application names', async () => {
      const appNames = ['app1.js', 'server.js', 'worker.js'];

      for (const appName of appNames) {
        mockSerialService.portWritelnWaitfor.mockResolvedValue('');
        await service.setForeverApp(appName);

        expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
          `forever start -w ${appName}`,
          'EOL',
          20000
        );
      }
    });
  });

  describe('integration tests', () => {
    it('should handle complete Chirimen setup workflow', async () => {
      // Node.jsがインストールされていない場合のセットアップ
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('-bash: node: command not found') // node -v
        .mockResolvedValueOnce('') // mkdir chirimenSetup
        .mockResolvedValueOnce('') // cd chirimenSetup
        .mockResolvedValueOnce('') // VERSION=v22.9.0
        .mockResolvedValueOnce('') // DISTRO=linux-armv6l
        .mockResolvedValueOnce('') // wget node.js
        .mockResolvedValueOnce('') // sudo mkdir -p /usr/local/lib/nodejs
        .mockResolvedValueOnce('') // sudo tar -xJvf
        .mockResolvedValueOnce('') // echo to ~/.profile
        .mockResolvedValueOnce('') // . ~/.profile
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce('v22.9.0') // node -v (after install)
        .mockResolvedValueOnce('10.0.0') // npm -v
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_camera 0
        .mockResolvedValueOnce('') // sudo raspi-config nonint do_legacy 0
        .mockResolvedValueOnce('command not found') // which forever
        .mockResolvedValueOnce('') // sudo npm install -g forever
        .mockResolvedValueOnce('') // mkdir ~/myApp
        .mockResolvedValueOnce('') // cd ~/myApp
        .mockResolvedValueOnce('') // cd
        .mockResolvedValueOnce(''); // cd

      mockFileService.showDir.mockResolvedValue();

      const setupResult = await service.setupChirimen();
      expect(setupResult).toContain('CONGRATURATIONS. setup completed!');

      // I2Cデバイスの検出
      const mockI2COutput =
        '     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f\n00:          -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockI2COutput);

      const i2cResult = await service.i2cdetect();
      expect(i2cResult).toContain('<pre><code>');

      // JavaScriptアプリケーションの取得
      const mockFiles: FileInfo[] = [
        { name: 'app.js', size: 1024, isDirectory: false },
        { name: 'server.js', size: 2048, isDirectory: false },
      ];

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      mockFileService.showDir.mockResolvedValue();
      mockFileService.listAll.mockResolvedValue({ files: mockFiles });

      const jsApps = await service.getJsApps();
      expect(jsApps).toEqual(['app.js', 'server.js']);

      // アプリケーションの管理
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.setForeverApp('app.js');
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'forever start -w app.js',
        'EOL',
        20000
      );

      await service.stopAllForeverApp();
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'forever stopall',
        'EOL',
        20000
      );
    });

    it('should handle error scenarios gracefully', async () => {
      // セットアップ中のエラー
      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd
        .mockRejectedValueOnce(new Error('Command failed')); // node -v

      await expect(service.setupChirimen()).rejects.toThrow('Command failed');

      // I2C検出のエラー
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('I2C failed')
      );

      await expect(service.i2cdetect()).rejects.toThrow('I2C failed');

      // アプリケーション管理のエラー
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Forever failed')
      );

      await expect(service.setForeverApp('app.js')).rejects.toThrow(
        'Forever failed'
      );
      await expect(service.stopAllForeverApp()).rejects.toThrow(
        'Forever failed'
      );
    });
  });
});
