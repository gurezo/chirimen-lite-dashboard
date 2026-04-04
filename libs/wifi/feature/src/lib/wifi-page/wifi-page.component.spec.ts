import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogService } from '@libs-dialogs-util';
import { NotificationService } from '@libs-shared-ui';
import {
  WifiRebootFlowService,
  WifiScanService,
} from '@libs-wifi-data-access';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { WifiPageComponent } from './wifi-page.component';

describe('WifiPageComponent', () => {
  let component: WifiPageComponent;
  let fixture: ComponentFixture<WifiPageComponent>;

  beforeEach(async () => {
    const dialogRef = { closed: of(undefined) };
    await TestBed.configureTestingModule({
      imports: [WifiPageComponent],
      providers: [
        {
          provide: DialogService,
          useValue: {
            open: vi.fn().mockReturnValue(dialogRef),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn(),
            info: vi.fn(),
          },
        },
        {
          provide: SerialFacadeService,
          useValue: { isConnected: vi.fn().mockReturnValue(true) },
        },
        {
          provide: WifiScanService,
          useValue: {
            scanNetworks: vi
              .fn()
              .mockResolvedValue({ wifiInfos: [], rawData: [] }),
            getWifiStatus: vi.fn().mockResolvedValue({
              ipInfo: '',
              wlInfo: '',
            }),
            checkChirimenTutorialReachability: vi
              .fn()
              .mockResolvedValue('OK'),
          },
        },
        {
          provide: WifiRebootFlowService,
          useValue: {
            restartWifiService: vi.fn().mockResolvedValue(undefined),
            rebootDevice: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WifiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('runWifiScan fills wifiInfoList when serial is connected', async () => {
    const scan = TestBed.inject(WifiScanService);
    vi.mocked(scan.scanNetworks).mockResolvedValue({
      rawData: [],
      wifiInfos: [
        {
          ssid: 'x',
          address: '00:00:00:00:00:01',
          channel: 1,
          frequency: '2.4',
          quality: '50',
          spec: 'WPA2',
        },
      ],
    });
    await component.runWifiScan();
    expect(component.wifiInfoList.length).toBe(1);
    expect(component.wifiInfoList[0]?.ssid).toBe('x');
  });
});
