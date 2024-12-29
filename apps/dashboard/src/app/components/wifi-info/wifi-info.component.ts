import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { WiFiInformation } from '../../models';

@Component({
  selector: 'choh-wifi-info',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './wifi-info.component.html',
  styleUrl: './wifi-info.component.scss',
})
export class WifiInfoComponent {
  @Input() wifiInfo!: WiFiInformation;
}
