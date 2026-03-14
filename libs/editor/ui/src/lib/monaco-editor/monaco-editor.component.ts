import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'choh-monaco-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  template: `
    <div>
      <ngx-monaco-editor
        [options]="editorOptions()"
        [ngModel]="code()"
        (ngModelChange)="code.set($event)"
      />
    </div>
  `,
})
export class MonacoEditorComponent {
  code = model<string>('');

  editorOptions = input({
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
  });
}
