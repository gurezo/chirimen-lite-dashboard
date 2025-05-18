import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconService } from './shared/service';

@Component({
  selector: 'choh-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'CHIRIMEN Lite DashBoard';
  iconService = inject(IconService);

  ngOnInit(): void {
    this.iconService.registIcons();
  }
}
