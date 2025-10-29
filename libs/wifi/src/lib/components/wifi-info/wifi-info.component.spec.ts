import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WiFiInformation } from '../../models/wifi.model';
import { WifiInfoComponent } from './wifi-info.component';

describe('WifiInfoComponent', () => {
  let component: WifiInfoComponent;
  let fixture: ComponentFixture<WifiInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WifiInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WifiInfoComponent);
    component = fixture.componentInstance;
    component.wifiInfo = {
      SSID: 'test-ssid',
      address: '00:00:00:00:00:00',
      channel: 1,
      frequency: '2.4 GHz',
      quality: 'Quality=70/70',
      spec: 'WPA2',
    } as WiFiInformation;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
