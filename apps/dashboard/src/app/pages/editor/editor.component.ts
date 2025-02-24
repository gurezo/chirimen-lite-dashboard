import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { EditorToolBarComponent } from '../../components';
import { MonacoEditorService } from './services';

@Component({
  selector: 'choh-editor',
  imports: [FormsModule, MonacoEditorModule, EditorToolBarComponent],
  template: `
    <choh-editor-tool-bar
      (eventSaveFile)="saveFile()"
      (eventFormatFile)="formatFile()"
    />
    <div>
      <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" />
    </div>
  `,
  providers: [MonacoEditorService],
})
export default class EditorComponent implements OnInit {
  private monaca = inject(MonacoEditorService);
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
  };

  // code: string = 'function x() {\nconsole.log("Hello world!");\n}';

  code: string = `
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

  ngOnInit(): void {
    // let line = editor.getPosition();
    // console.log(line);
  }

  saveFile(): void {}
  formatFile(): void {}
}
