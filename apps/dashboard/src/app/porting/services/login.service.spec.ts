import { TestBed } from '@angular/core/testing';
import { DateUtils } from '../utils';
import { SerialError } from '../utils/serial.errors';
import { LoginConfig, LoginService } from './login.service';
import { SerialService } from './serial.service';

// SerialServiceのモック
jest.mock('./serial.service');

describe('LoginService', () => {
  let service: LoginService;
  let mockSerialService: jest.Mocked<SerialService>;

  const defaultConfig: LoginConfig = {
    loginId: 'pi',
    loginPassword: 'raspberry',
    commandPrompt: 'pi@raspberrypi:',
    language: 'en',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoginService,
        {
          provide: SerialService,
          useValue: {
            write: jest.fn(),
            waitForPattern: jest.fn(),
            disconnect: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(LoginService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('autoLogin', () => {
    xit('should perform auto login with default config', async () => {
      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$') // checkLoginStatus
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin();

      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
      expect(mockSerialService.waitForPattern).toHaveBeenCalledTimes(6);
    });

    it('should perform auto login with custom config', async () => {
      const customConfig: Partial<LoginConfig> = {
        loginId: 'admin',
        loginPassword: 'admin123',
        commandPrompt: 'admin@server:',
        language: 'ja',
      };

      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('admin@server:~$') // waitForPrompt
        .mockResolvedValueOnce('admin@server:~$') // checkLoginStatus
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('admin@server:~$') // performLogin - password
        .mockResolvedValueOnce('admin@server:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('admin@server:~$') // performInitialSetup - timezone
        .mockResolvedValueOnce('admin@server:~$'); // performInitialSetup - date

      await service.autoLogin(customConfig);

      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
      expect(mockSerialService.waitForPattern).toHaveBeenCalledTimes(7);
    });

    it('should skip login when already logged in', async () => {
      // モックの設定 - 既にログイン済み
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$') // checkLoginStatus
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin();

      expect(mockSerialService.waitForPattern).toHaveBeenCalledTimes(4);
      // ログイン処理は呼ばれない
      expect(mockSerialService.waitForPattern).not.toHaveBeenCalledWith(
        'pi\n',
        'Password:',
        5000
      );
    });

    it('should throw SerialError when waitForPrompt fails after max retries', async () => {
      // モックの設定 - プロンプト待機が失敗
      mockSerialService.waitForPattern.mockRejectedValue(new Error('Timeout'));

      await expect(service.autoLogin()).rejects.toThrow(SerialError);
      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
    }, 15000);

    it('should throw SerialError when login process fails', async () => {
      // モックの設定 - ログイン処理で失敗
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('login:') // checkLoginStatus - ログインしていない
        .mockRejectedValueOnce(new Error('Login failed')); // performLogin - loginId

      await expect(service.autoLogin()).rejects.toThrow(SerialError);
    });

    xit('should throw SerialError when initial setup fails', async () => {
      // モックの設定 - 初期設定で失敗
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$') // checkLoginStatus
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockRejectedValueOnce(new Error('Setup failed')); // performInitialSetup - HISTCONTROL

      await expect(service.autoLogin()).rejects.toThrow(SerialError);
    }, 15000);
  });

  describe('waitForPrompt (private method)', () => {
    it('should retry when prompt detection fails', async () => {
      // モックの設定 - 最初は失敗、2回目で成功
      mockSerialService.waitForPattern
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce('pi@raspberrypi:~$');

      await service.autoLogin();

      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        '\n',
        ':',
        1000
      );
    });

    xit('should throw error after maximum retries', async () => {
      // モックの設定 - 10回連続で失敗
      mockSerialService.waitForPattern.mockRejectedValue(
        new Error('Always fails')
      );

      await expect(service.autoLogin()).rejects.toThrow(SerialError);
      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
    });
  });

  describe('checkLoginStatus (private method)', () => {
    it('should return true when already logged in', async () => {
      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // checkLoginStatus

      await service.autoLogin();

      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        '\n',
        ':',
        1000
      );
    });

    it('should return false when not logged in', async () => {
      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('login:') // checkLoginStatus - ログインしていない
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin();

      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        '\n',
        ':',
        1000
      );
    });

    it('should return false when pattern matching fails', async () => {
      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockRejectedValueOnce(new Error('Pattern match failed')); // checkLoginStatus

      await service.autoLogin();

      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        '\n',
        ':',
        1000
      );
    });
  });

  describe('performLogin (private method)', () => {
    it('should enter login ID and password', async () => {
      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('login:') // checkLoginStatus - ログインしていない
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin();

      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        'pi\n',
        'Password:',
        5000
      );
      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        'raspberry\n',
        '\\$',
        40000
      );
    });

    it('should use custom login credentials', async () => {
      const customConfig: Partial<LoginConfig> = {
        loginId: 'admin',
        loginPassword: 'admin123',
      };

      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('admin@server:~$') // waitForPrompt
        .mockResolvedValueOnce('login:') // checkLoginStatus - ログインしていない
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('admin@server:~$') // performLogin - password
        .mockResolvedValueOnce('admin@server:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('admin@server:~$'); // performInitialSetup - date

      await service.autoLogin(customConfig);

      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        'admin\n',
        'Password:',
        5000
      );
      expect(mockSerialService.waitForPattern).toHaveBeenCalledWith(
        'admin123\n',
        '\\$',
        40000
      );
    });
  });

  describe('performInitialSetup (private method)', () => {
    xit('should set HISTCONTROL for English', async () => {
      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$') // checkLoginStatus
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin();

      // 5番目の呼び出しがHISTCONTROLの設定
      expect(mockSerialService.waitForPattern).toHaveBeenNthCalledWith(
        5,
        ' HISTCONTROL=ignoreboth',
        'pi@raspberrypi:',
        undefined
      );
    });

    xit('should set timezone for Japanese', async () => {
      const customConfig: Partial<LoginConfig> = {
        language: 'ja',
      };

      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$') // checkLoginStatus
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - timezone
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin(customConfig);

      // 6番目の呼び出しがタイムゾーン設定
      expect(mockSerialService.waitForPattern).toHaveBeenNthCalledWith(
        6,
        ' sudo timedatectl set-timezone Asia/Tokyo',
        'pi@raspberrypi:',
        undefined
      );
    });

    xit('should set system date and time', async () => {
      // DateUtils.buildDateCommandをモック
      const mockDateCommand = 'date -s "2024-01-01 12:00:00"';
      jest
        .spyOn(DateUtils, 'buildDateCommand')
        .mockReturnValue(mockDateCommand);

      // モックの設定
      mockSerialService.waitForPattern
        .mockResolvedValueOnce('pi@raspberrypi:~$') // waitForPrompt
        .mockResolvedValueOnce('pi@raspberrypi:~$') // checkLoginStatus
        .mockResolvedValueOnce('Password:') // performLogin - loginId
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performLogin - password
        .mockResolvedValueOnce('pi@raspberrypi:~$') // performInitialSetup - HISTCONTROL
        .mockResolvedValueOnce('pi@raspberrypi:~$'); // performInitialSetup - date

      await service.autoLogin();

      expect(DateUtils.buildDateCommand).toHaveBeenCalled();
      // 6番目の呼び出しが日時設定
      expect(mockSerialService.waitForPattern).toHaveBeenNthCalledWith(
        6,
        mockDateCommand,
        'pi@raspberrypi:',
        undefined
      );
    });
  });

  describe('logout', () => {
    it('should disconnect serial service', async () => {
      await service.logout();

      expect(mockSerialService.disconnect).toHaveBeenCalled();
    });

    it('should throw SerialError when disconnect fails', async () => {
      mockSerialService.disconnect.mockRejectedValue(
        new Error('Disconnect failed')
      );

      await expect(service.logout()).rejects.toThrow(SerialError);
    });
  });

  describe('constants', () => {
    it('should have correct control characters', () => {
      expect((service as any).ctrlc).toBe('\x03');
      expect((service as any).ctrld).toBe('\x04');
    });

    it('should have correct default config', () => {
      expect((service as any).defaultConfig).toEqual(defaultConfig);
    });
  });
});
