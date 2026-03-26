/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileTreeFeatureComponent } from './file-tree-feature.component';
import { FileListService } from '@libs-file-manager-data-access';
import { FileTreeNode } from '@libs-file-manager-util';

describe('FileTreeFeatureComponent', () => {
  let component: FileTreeFeatureComponent;
  let fixture: ComponentFixture<FileTreeFeatureComponent>;
  const listMock = vi.fn<() => Promise<FileTreeNode[]>>();

  beforeEach(async () => {
    listMock.mockResolvedValue([
      { name: 'docs', path: './docs', isDirectory: true },
      { name: 'main.ts', path: './main.ts', isDirectory: false },
    ]);

    await TestBed.configureTestingModule({
      imports: [FileTreeFeatureComponent],
      providers: [
        {
          provide: FileListService,
          useValue: { list: listMock },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTreeFeatureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads nodes on init', () => {
    expect(listMock).toHaveBeenCalledWith('.');
    expect(component.nodes.length).toBe(2);
  });
});
