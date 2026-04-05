/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileTreeFeatureComponent } from './file-tree-feature.component';
import { FileService } from '@libs-file-manager-data-access';
import { FileTreeNode } from '@libs-file-manager-util';

describe('FileTreeFeatureComponent', () => {
  let component: FileTreeFeatureComponent;
  let fixture: ComponentFixture<FileTreeFeatureComponent>;
  const listTreeMock = vi.fn<() => Promise<FileTreeNode[]>>();

  beforeEach(async () => {
    listTreeMock.mockResolvedValue([
      { name: 'docs', path: './docs', isDirectory: true },
      { name: 'main.ts', path: './main.ts', isDirectory: false },
    ]);

    await TestBed.configureTestingModule({
      imports: [FileTreeFeatureComponent],
      providers: [
        {
          provide: FileService,
          useValue: { listTree: listTreeMock },
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
    expect(listTreeMock).toHaveBeenCalledWith('.');
    expect(component.nodes.length).toBe(2);
  });
});
