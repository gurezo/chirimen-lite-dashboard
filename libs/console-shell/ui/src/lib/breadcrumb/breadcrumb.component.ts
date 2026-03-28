import { Component, input } from '@angular/core';
import type { BreadcrumbSegment } from '@libs-console-shell-util';

@Component({
  selector: 'lib-breadcrumb',
  standalone: true,
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent {
  segments = input<BreadcrumbSegment[]>([]);
}
