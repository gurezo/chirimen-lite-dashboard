import { Component } from '@angular/core';
import { WifiSettingContainersComponent } from '../../containers';

@Component({
  selector: 'choh-wifi-setting',
  standalone: true,
  imports: [WifiSettingContainersComponent],
  template: `<choh-wifi-setting />`,
})
export default class WifiSettingComponent {}
