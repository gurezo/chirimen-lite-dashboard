import { Component, output, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import type { editor } from 'monaco-editor';

@Component({
  selector: 'choh-monaco-editor',
  imports: [FormsModule, MonacoEditorModule],
  template: `
    <div class="flex h-full min-h-0 min-w-0 flex-col">
      <ngx-monaco-editor
        class="block min-h-0 min-w-0 flex-1"
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
  editorInitialized = output<editor.IStandaloneCodeEditor>();

  editorOptions = input({
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
  });

  onEditorInit(editorInstance: editor.IStandaloneCodeEditor): void {
    this.editorInitialized.emit(editorInstance);
    editorInstance.onDidChangeModelContent((event) => {
      if (event.isFlush) {
        return;
      }
      this.contentEdited.emit();
    });
  }
}
