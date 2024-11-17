import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonacoEditorModule, provideMonacoEditor } from 'ngx-monaco-editor-v2';

import { monacoConfig } from '../../shared';
import EditorComponent from './editor.component';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorComponent, MonacoEditorModule],
      providers: [provideMonacoEditor(monacoConfig)],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
