import { Component } from '@angular/core';
import { EditorContainersComponent } from '../../containers';

@Component({
  selector: 'choh-editor',
  standalone: true,
  imports: [EditorContainersComponent],
  template: `<choh-editor-containers />`,
})
export default class EditorComponent {}
