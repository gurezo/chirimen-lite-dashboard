/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialWebSerialState } from '@libs-web-serial-state';
import { FileListService } from '@libs-file-manager-data-access';
import { FileTreeNode } from '@libs-file-manager-util';
import { FileTreeFeatureComponent } from './file-tree-feature.component';

describe('FileTreeFeatureComponent', () => {
  let component: FileTreeFeatureComponent;
  let fixture: ComponentFixture<FileTreeFeatureComponent>;
  let mockStore: MockStore;
  const listMock = vi.fn<() => Promise<FileTreeNode[]>>();

  beforeEach(async () => {
    listMock.mockResolvedValue([
      { name: 'docs', path: './docs', isDirectory: true },
      { name: 'main.ts', path: './main.ts', isDirectory: false },
    ]);

    await TestBed.configureTestingModule({
      imports: [FileTreeFeatureComponent],
      providers: [
        provideMockStore({
          initialState: {
            webSerial: { ...initialWebSerialState },
          },
        }),
        {
          provide: FileListService,
          useValue: { list: listMock },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTreeFeatureComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not list until connected and post-connect init done', async () => {
    await fixture.whenStable();
    expect(listMock).not.toHaveBeenCalled();

    mockStore.setState({
      webSerial: {
        ...initialWebSerialState,
        isConnected: true,
        isPostConnectInitDone: false,
      },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(listMock).not.toHaveBeenCalled();
  });

  it('loads current path when connected and post-connect init done', async () => {
    mockStore.setState({
      webSerial: {
        ...initialWebSerialState,
        isConnected: true,
        isPostConnectInitDone: true,
      },
    });
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();

    expect(listMock).toHaveBeenCalledWith('.');
    expect(component.nodes.length).toBe(2);
  });
});
