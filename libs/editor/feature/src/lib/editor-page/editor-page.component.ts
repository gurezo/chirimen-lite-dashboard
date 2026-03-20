import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import {
  EditorToolbarComponent,
  FileNameDisplayComponent,
  MonacoEditorComponent,
} from '@libs-editor-ui';
import { EditorService, MonacoEditorService } from '@libs-editor-data-access';

const DEFAULT_CODE = `
    onload = async function () {
      window.addEventListener("message", receiveMessage, false);
      portWritelnWaitfor = window.opener.portWritelnWaitfor;
      getOutputLines = function (inp) {
        var ret = window.opener.getOutputLines(inp);
        console.log(ret);
        return ret;
      };
      cmdPrompt = window.opener.cmdPrompt;
      mv = window.opener.mv;
      cp = window.opener.cp;
      showDir = window.opener.showDir;
    };
    const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
`;

@Component({
  selector: 'choh-editor-page',
  standalone: true,
  imports: [
    MonacoEditorComponent,
    EditorToolbarComponent,
    FileNameDisplayComponent,
  ],
  providers: [MonacoEditorService],
  template: `
    <div class="editor-page">
      <choh-editor-toolbar />
      <choh-file-name-display />
      <choh-monaco-editor [code]="code()" (codeChange)="code.set($event)" />
    </div>
  `,
})
export class EditorPageComponent implements OnInit {
  code = signal(DEFAULT_CODE.trim());

  private editorService = inject(EditorService);
  private readonly filePath = '/home/pi/edited.js';

  async ngOnInit(): Promise<void> {
    try {
      const loaded = await this.editorService.loadTextFile(this.filePath);
      this.code.set(loaded);
    } catch {
      // ファイルが存在しない等の場合はデフォルトコードのまま
    }
  }

  @HostListener('window:keydown', ['$event'])
  async onKeydown(event: KeyboardEvent): Promise<void> {
    const isSaveShortcut =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
    if (!isSaveShortcut) return;

    event.preventDefault();
    await this.editorService.saveTextFile(this.filePath, this.code());
  }
}
