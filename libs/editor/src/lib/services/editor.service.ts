import { Injectable } from '@angular/core';
import { SourcePath } from '../source-path.model';
import type { editor } from 'monaco-editor';

/**
 * エディターサービス
 *
 * Monaco Editor の管理とファイル編集機能を担当
 * porting/services/editor.service.ts から移行・完成
 */
@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private editor: editor.IStandaloneCodeEditor | null = null;
  private editedFlag = false;
  private saveDisabled = false;
  private sourcePath: SourcePath | null = null;

  /**
   * Monaco Editor を初期化
   *
   * @param container エディターのコンテナ要素
   * @param options エディターオプション
   */
  initializeEditor(
    _container: HTMLElement,
    _options?: editor.IStandaloneEditorConstructionOptions,
  ): void {
    // Note: Monaco Editor は ngx-monaco-editor-v2 経由で使用されるため、
    // 直接 create() を呼ぶのではなく、コンポーネント側で初期化される
    // const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    //   value: '',
    //   language: 'javascript',
    //   theme: 'vs-dark',
    //   automaticLayout: true,
    //   minimap: { enabled: false },
    //   fontSize: 14,
    //   ...options,
    // };
    // this.editor = editor.create(container, defaultOptions);

    // エディターがセットされている場合のみ変更を監視
    if (this.editor) {
      this.editor.onDidChangeModelContent(() => {
        this.editedFlag = true;
      });
    }
  }
}
