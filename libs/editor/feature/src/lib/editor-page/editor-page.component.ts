import { Component, signal } from '@angular/core';
import {
  EditorToolbarComponent,
  FileNameDisplayComponent,
  MonacoEditorComponent,
} from '@libs-editor-ui';
import { MonacoEditorService } from '@libs-editor-data-access';

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
export class EditorPageComponent {
  code = signal(DEFAULT_CODE.trim());
}
