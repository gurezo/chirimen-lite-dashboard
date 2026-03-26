import { Component, output, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import type { editor } from 'monaco-editor';

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
        (onInit)="onEditorInit($event)"
      />
    </div>
  `,
})
export class MonacoEditorComponent {
  code = model<string>('');
  contentEdited = output<void>();

  editorOptions = input({
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
  });

  onEditorInit(editorInstance: editor.IStandaloneCodeEditor): void {
    editorInstance.onDidChangeModelContent((event) => {
      if (event.isFlush) {
        return;
      }
      this.contentEdited.emit();
    });
  }
}
