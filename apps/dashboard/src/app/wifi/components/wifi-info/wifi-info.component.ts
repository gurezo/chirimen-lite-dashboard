import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { WiFiInformation } from '../../models/wifi.models';

@Component({
  selector: 'choh-wifi-info',
  imports: [MatCardModule],
  templateUrl: './wifi-info.component.html',
})
export class WifiInfoComponent {
  @Input() wifiInfo!: WiFiInformation;
}
