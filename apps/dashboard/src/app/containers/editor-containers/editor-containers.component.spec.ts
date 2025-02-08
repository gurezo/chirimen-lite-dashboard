import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonacoEditorModule, provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { monacoConfig } from '../../shared';
import { EditorContainersComponent } from './editor-containers.component';

describe('EditorContainersComponent', () => {
  let component: EditorContainersComponent;
  let fixture: ComponentFixture<EditorContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorContainersComponent, MonacoEditorModule],
      providers: [provideMonacoEditor(monacoConfig)],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
