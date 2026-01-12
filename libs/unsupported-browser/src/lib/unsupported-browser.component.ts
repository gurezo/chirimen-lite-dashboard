import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'choh-unsupported-browser',
  imports: [MatProgressSpinner],
  templateUrl: './unsupported-browser.component.html',
  styles: [
    `
      .fade-in {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export default class UnsupportedBrowserComponent {}
