import { TestBed } from '@angular/core/testing';

import { FileUploadDialogService } from './file-upload.dialog.service';

describe('FileUploadDialogService', () => {
  let service: FileUploadDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileUploadDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
