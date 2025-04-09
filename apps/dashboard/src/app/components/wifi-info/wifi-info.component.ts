import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { WiFiInformation } from '../../shared/models';

@Component({
  selector: 'choh-wifi-info',
  imports: [MatCardModule],
  templateUrl: './wifi-info.component.html',
  styleUrl: './wifi-info.component.scss',
})
export class WifiInfoComponent {
  @Input() wifiInfo!: WiFiInformation;
}
