import { Injectable, inject } from '@angular/core';
import { DirectoryService } from '@dashboard/directory';
import { FileContentService } from '@dashboard/file';
import { SourcePath } from '@dashboard/models';
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
  private fileContent = inject(FileContentService);
  private directory = inject(DirectoryService);

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
    container: HTMLElement,
    options?: editor.IStandaloneEditorConstructionOptions
  ): void {
    const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      ...options,
    };

    // Note: Monaco Editor は ngx-monaco-editor-v2 経由で使用されるため、
    // 直接 create() を呼ぶのではなく、コンポーネント側で初期化される
    // this.editor = editor.create(container, defaultOptions);

    // エディターがセットされている場合のみ変更を監視
    if (this.editor) {
      this.editor.onDidChangeModelContent(() => {
        this.editedFlag = true;
      });
    }
  }

  /**
   * ファイルを編集用に開く
   *
   * @param srcTxt ソーステキスト
   * @param fileName ファイル名
   * @param currentDir カレントディレクトリ
   * @param editFlg 編集可能フラグ
   */
  async editSource(
    srcTxt: string,
    fileName: string,
    currentDir: string,
    editFlg: boolean
  ): Promise<void> {
    try {
      if (!this.editor) {
        throw new Error('Editor is not initialized');
      }

      this.editor.setValue(srcTxt);
      this.sourcePath = { fileName, dir: currentDir };
      this.editedFlag = false;

      // 編集不可の場合は読み取り専用に設定
      if (!editFlg) {
        await this.sleep(100);
        this.disableSave();
      } else {
        this.saveDisabled = false;
        this.setReadOnly(false);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to edit source: ${errorMessage}`);
    }
  }

  /**
   * ソースファイルを保存
   *
   * @param forceOption 強制保存フラグ
   * @returns 保存したテキスト、保存しない場合は null
   */
  async saveSource(forceOption: boolean = false): Promise<string | null> {
    try {
      if (!this.editor) {
        throw new Error('Editor is not initialized');
      }

      if (this.saveDisabled) {
        console.log('Save disabled.. exit!');
        return null;
      }

      if (!this.editedFlag && !forceOption) {
        console.warn('Source text is not yet changed, skip save.');
        return null;
      }

      const saveTxt = this.editor.getValue();

      // ファイルに保存
      if (this.sourcePath) {
        const fullPath = `${this.sourcePath.dir}/${this.sourcePath.fileName}`;
        await this.fileContent.writeTextFile(fullPath, saveTxt);
      }

      this.editedFlag = false;
      return saveTxt;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save source: ${errorMessage}`);
    }
  }

  /**
   * ソースコードをフォーマット
   */
  formatSource(): void {
    try {
      if (!this.editor) {
        throw new Error('Editor is not initialized');
      }

      this.editor.getAction('editor.action.formatDocument')?.run();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to format source: ${errorMessage}`);
    }
  }

  /**
   * 保存を無効化（読み取り専用モード）
   */
  disableSave(): void {
    try {
      this.setReadOnly(true);
      this.saveDisabled = true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to disable save: ${errorMessage}`);
    }
  }

  /**
   * 読み取り専用モードを設定
   *
   * @param readonlyOpt 読み取り専用にするか
   */
  setReadOnly(readonlyOpt: boolean): void {
    try {
      if (!this.editor) {
        throw new Error('Editor is not initialized');
      }

      this.editor.updateOptions({ readOnly: readonlyOpt });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to set read only: ${errorMessage}`);
    }
  }

  /**
   * 現在のソースパスを取得
   *
   * @returns ソースパス
   */
  getSourcePath(): SourcePath | null {
    return this.sourcePath;
  }

  /**
   * エディターの内容を取得
   *
   * @returns エディターの内容
   */
  getValue(): string | null {
    return this.editor?.getValue() || null;
  }

  /**
   * エディターの内容を設定
   *
   * @param value 設定する内容
   */
  setValue(value: string): void {
    this.editor?.setValue(value);
    this.editedFlag = false;
  }

  /**
   * 編集フラグを取得
   *
   * @returns 編集されている場合 true
   */
  isEdited(): boolean {
    return this.editedFlag;
  }

  /**
   * 保存が無効かどうか
   *
   * @returns 保存が無効な場合 true
   */
  isSaveDisabled(): boolean {
    return this.saveDisabled;
  }

  /**
   * エディターインスタンスを取得
   *
   * @returns Monaco Editor インスタンス
   */
  getEditor(): editor.IStandaloneCodeEditor | null {
    return this.editor;
  }

  /**
   * エディターインスタンスを設定
   * ngx-monaco-editor-v2 から初期化されたエディターを受け取る
   *
   * @param editorInstance Monaco Editor インスタンス
   */
  setEditor(editorInstance: editor.IStandaloneCodeEditor): void {
    this.editor = editorInstance;

    // 変更を監視
    this.editor.onDidChangeModelContent(() => {
      this.editedFlag = true;
    });
  }

  /**
   * エディターを破棄
   */
  dispose(): void {
    this.editor?.dispose();
    this.editor = null;
    this.sourcePath = null;
    this.editedFlag = false;
    this.saveDisabled = false;
  }

  /**
   * ファイルを開く
   *
   * @param fileName ファイル名
   * @param size ファイルサイズ
   * @param editFlg 編集可能フラグ
   */
  async showFile(
    fileName: string,
    size: number,
    editFlg: boolean
  ): Promise<void> {
    try {
      const currentDir = this.directory.getCurrentDir() || '.';
      const fullPath = `${currentDir}/${fileName}`;

      // ファイルの内容を取得
      try {
        const content = await this.fileContent.readFile(fullPath);

        if (content.isText && typeof content.content === 'string') {
          // テキストファイルの場合、エディタで開く
          await this.editSource(content.content, fileName, currentDir, editFlg);
        } else {
          throw new Error('Binary files cannot be edited');
        }
      } catch (error) {
        // ファイルが存在しない場合は新規作成
        await this.editSource('', fileName, currentDir, editFlg);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to show file: ${errorMessage}`);
    }
  }

  /**
   * 新規テキストファイルを作成
   *
   * @param fileName ファイル名
   */
  async createNewText(fileName: string): Promise<void> {
    try {
      const currentDir = this.directory.getCurrentDir() || '.';
      await this.editSource('', fileName, currentDir, true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create new text: ${errorMessage}`);
    }
  }

  /**
   * 編集したテキストを保存
   *
   * @param srcTxt ソーステキスト
   * @param sourcePath ソースパス
   */
  async saveEditedText(srcTxt: string, sourcePath: SourcePath): Promise<void> {
    try {
      const fullPath = `${sourcePath.dir}/${sourcePath.fileName}`;
      await this.fileContent.writeTextFile(fullPath, srcTxt);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save edited text: ${errorMessage}`);
    }
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // Legacy methods (後方互換性のため)
  // ============================================

  /**
   * @deprecated Use editSource() instead
   */
  async editSrc(
    srcTxt: string,
    fileName: string,
    currentDir: string,
    editFlg: boolean
  ): Promise<void> {
    return this.editSource(srcTxt, fileName, currentDir, editFlg);
  }

  /**
   * @deprecated Use formatSource() instead
   */
  jsFormat(): void {
    this.formatSource();
  }
}
