import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'choh-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  host: {
    class: 'block h-full min-h-0',
  },
})
export class AppComponent {
  title = 'CHIRIMEN Lite Console';
}
