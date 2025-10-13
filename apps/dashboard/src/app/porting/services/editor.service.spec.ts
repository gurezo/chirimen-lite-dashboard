import { TestBed } from '@angular/core/testing';
import { SourcePath } from '../types';
import { EditorError } from '../utils/serial.errors';
import { EditorService } from './editor.service';

describe('EditorService', () => {
  let service: EditorService;
  let mockEditor: any;

  beforeEach(() => {
    // Monaco Editorのモックを作成
    mockEditor = {
      setValue: jest.fn(),
      onDidChangeModelContent: jest.fn(),
      getValue: jest.fn(),
      getAction: jest.fn(),
      updateOptions: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [EditorService],
    });

    service = TestBed.inject(EditorService);

    // プライベートプロパティにモックエディタを設定
    (service as any).editor = mockEditor;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('editSrc', () => {
    it('should set editor value and setup change listener', async () => {
      const srcTxt = 'test content';
      const fileName = 'test.txt';
      const currentDir = '/home/pi';
      const editFlg = true;

      await service.editSrc(srcTxt, fileName, currentDir, editFlg);

      expect(mockEditor.setValue).toHaveBeenCalledWith(srcTxt);
      expect(mockEditor.onDidChangeModelContent).toHaveBeenCalled();
    });

    it('should set source path', async () => {
      const srcTxt = 'test content';
      const fileName = 'test.txt';
      const currentDir = '/home/pi';
      const editFlg = true;

      await service.editSrc(srcTxt, fileName, currentDir, editFlg);

      const sourcePath = service.getSourcePath();
      expect(sourcePath).toEqual({ fileName, dir: currentDir });
    });

    it('should disable save when editFlg is false', async () => {
      const srcTxt = 'test content';
      const fileName = 'test.txt';
      const currentDir = '/home/pi';
      const editFlg = false;

      // sleep関数をモック
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return 1 as any;
      });

      await service.editSrc(srcTxt, fileName, currentDir, editFlg);

      // saveDisabledがtrueになることを確認
      expect((service as any).saveDisabled).toBe(true);
    });

    it('should throw EditorError when editor operation fails', async () => {
      const srcTxt = 'test content';
      const fileName = 'test.txt';
      const currentDir = '/home/pi';
      const editFlg = true;

      mockEditor.setValue.mockImplementation(() => {
        throw new Error('Editor error');
      });

      await expect(
        service.editSrc(srcTxt, fileName, currentDir, editFlg)
      ).rejects.toThrow(EditorError);
    });
  });

  describe('saveSource', () => {
    beforeEach(() => {
      (service as any).editedFlag = true;
      (service as any).saveDisabled = false;
      mockEditor.getValue.mockReturnValue('saved content');
    });

    it('should return saved text when conditions are met', () => {
      const result = service.saveSource(false);

      expect(result).toBe('saved content');
      expect(mockEditor.getValue).toHaveBeenCalled();
    });

    it('should return null when save is disabled', () => {
      (service as any).saveDisabled = true;

      const result = service.saveSource(false);

      expect(result).toBeNull();
    });

    it('should return null when source is not edited', () => {
      (service as any).editedFlag = false;

      const result = service.saveSource(false);

      expect(result).toBeNull();
    });

    it('should return null when force option is false and save is disabled', () => {
      (service as any).saveDisabled = true;

      const result = service.saveSource(false);

      expect(result).toBeNull();
    });

    it('should reset edited flag after save', () => {
      service.saveSource(false);

      expect((service as any).editedFlag).toBe(false);
    });

    it('should throw EditorError when editor operation fails', () => {
      mockEditor.getValue.mockImplementation(() => {
        throw new Error('Editor error');
      });

      expect(() => service.saveSource(false)).toThrow(EditorError);
    });
  });

  describe('jsFormat', () => {
    it('should call editor format action', () => {
      const mockAction = { run: jest.fn() };
      mockEditor.getAction.mockReturnValue(mockAction);

      service.jsFormat();

      expect(mockEditor.getAction).toHaveBeenCalledWith(
        'editor.action.formatDocument'
      );
      expect(mockAction.run).toHaveBeenCalled();
    });

    it('should throw EditorError when format operation fails', () => {
      mockEditor.getAction.mockImplementation(() => {
        throw new Error('Format error');
      });

      expect(() => service.jsFormat()).toThrow(EditorError);
    });
  });

  describe('disableSave', () => {
    it('should set read only and disable save', () => {
      service.disableSave();

      expect(mockEditor.updateOptions).toHaveBeenCalledWith({ readOnly: true });
      expect((service as any).saveDisabled).toBe(true);
    });

    it('should throw EditorError when operation fails', () => {
      mockEditor.updateOptions.mockImplementation(() => {
        throw new Error('Update error');
      });

      expect(() => service.disableSave()).toThrow(EditorError);
    });
  });

  describe('setReadOnly', () => {
    it('should set editor read only option', () => {
      service.setReadOnly(true);

      expect(mockEditor.updateOptions).toHaveBeenCalledWith({ readOnly: true });
    });

    it('should set editor editable option', () => {
      service.setReadOnly(false);

      expect(mockEditor.updateOptions).toHaveBeenCalledWith({
        readOnly: false,
      });
    });

    it('should throw EditorError when operation fails', () => {
      mockEditor.updateOptions.mockImplementation(() => {
        throw new Error('Update error');
      });

      expect(() => service.setReadOnly(true)).toThrow(EditorError);
    });
  });

  describe('getSourcePath', () => {
    it('should return current source path', () => {
      const sourcePath: SourcePath = { fileName: 'test.txt', dir: '/home/pi' };
      (service as any).sourcePath = sourcePath;

      const result = service.getSourcePath();

      expect(result).toEqual(sourcePath);
    });

    it('should return null when no source path is set', () => {
      (service as any).sourcePath = null;

      const result = service.getSourcePath();

      expect(result).toBeNull();
    });
  });

  describe('showFile', () => {
    it('should show existing file content', async () => {
      const fileName = 'test.txt';
      const size = 100;
      const editFlg = true;

      // getFileContentをモック
      jest
        .spyOn(service as any, 'getFileContent')
        .mockResolvedValue('file content');
      jest
        .spyOn(service as any, 'getCurrentDirectory')
        .mockReturnValue('/home/pi');

      await service.showFile(fileName, size, editFlg);

      expect((service as any).getFileContent).toHaveBeenCalledWith(
        fileName,
        size
      );
    });

    it('should create new file when content is null', async () => {
      const fileName = 'test.txt';
      const size = 100;
      const editFlg = true;

      jest.spyOn(service as any, 'getFileContent').mockResolvedValue(null);
      jest
        .spyOn(service as any, 'getCurrentDirectory')
        .mockReturnValue('/home/pi');

      await service.showFile(fileName, size, editFlg);

      expect((service as any).getFileContent).toHaveBeenCalledWith(
        fileName,
        size
      );
    });

    it('should throw EditorError when operation fails', async () => {
      const fileName = 'test.txt';
      const size = 100;
      const editFlg = true;

      jest
        .spyOn(service as any, 'getFileContent')
        .mockRejectedValue(new Error('File error'));

      await expect(service.showFile(fileName, size, editFlg)).rejects.toThrow(
        EditorError
      );
    });
  });

  describe('getFileContent', () => {
    it('should return null for now (simplified implementation)', async () => {
      const fileName = 'test.txt';
      const size = 100;

      const result = await service.getFileContent(fileName, size);

      expect(result).toBeNull();
    });
  });

  describe('createNewText', () => {
    it('should create new text file', async () => {
      const fileName = 'new.txt';
      jest
        .spyOn(service as any, 'getCurrentDirectory')
        .mockReturnValue('/home/pi');

      await service.createNewText(fileName);

      // editSrcが呼ばれることを確認（モックで検証）
      expect(mockEditor.setValue).toHaveBeenCalledWith('');
    });

    it('should throw EditorError when operation fails', async () => {
      const fileName = 'new.txt';

      mockEditor.setValue.mockImplementation(() => {
        throw new Error('Editor error');
      });

      await expect(service.createNewText(fileName)).rejects.toThrow(
        EditorError
      );
    });
  });

  describe('saveEditedText', () => {
    it('should log save operation', async () => {
      const srcTxt = 'edited content';
      const sourcePath: SourcePath = { fileName: 'test.txt', dir: '/home/pi' };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.saveEditedText(srcTxt, sourcePath);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving edited text:',
        srcTxt,
        'to:',
        sourcePath
      );
    });
  });
});
