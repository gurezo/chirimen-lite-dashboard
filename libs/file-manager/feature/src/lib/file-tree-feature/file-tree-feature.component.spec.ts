/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, NavigationEnd, Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';
import { initialWebSerialState } from '@libs-web-serial-state';
import { FileListService } from '@libs-file-manager-data-access';
import { FileTreeNode } from '@libs-file-manager-util';
import { FileTreeFeatureComponent } from './file-tree-feature.component';

describe('FileTreeFeatureComponent', () => {
  let component: FileTreeFeatureComponent;
  let fixture: ComponentFixture<FileTreeFeatureComponent>;
  let mockStore: MockStore;
  const listMock = vi.fn<() => Promise<FileTreeNode[]>>();
  const routerEvents = new Subject<NavigationEnd>();
  const urlSerializer = new DefaultUrlSerializer();
  let routerUrl = '/editor';

  beforeEach(async () => {
    listMock.mockResolvedValue([
      { name: 'docs', path: './docs', isDirectory: true },
      { name: 'main.ts', path: './main.ts', isDirectory: false },
    ]);
    routerUrl = '/editor';

    await TestBed.configureTestingModule({
      imports: [FileTreeFeatureComponent],
      providers: [
        provideMockStore({
          initialState: {
            webSerial: { ...initialWebSerialState },
          },
        }),
        {
          provide: Router,
          useValue: {
            events: routerEvents.asObservable(),
            get url() {
              return routerUrl;
            },
            parseUrl: (rawUrl: string) => urlSerializer.parse(rawUrl),
          },
        },
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

  it('does not list until connected, post-connect init done, and terminal route', async () => {
    await fixture.whenStable();
    expect(listMock).not.toHaveBeenCalled();

    mockStore.setState({
      webSerial: {
        ...initialWebSerialState,
        isConnected: true,
        isPostConnectInitDone: true,
      },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(listMock).not.toHaveBeenCalled();
  });

  it('loads current path when connected, post-connect done, and on terminal route', async () => {
    mockStore.setState({
      webSerial: {
        ...initialWebSerialState,
        isConnected: true,
        isPostConnectInitDone: true,
      },
    });
    routerUrl = '/terminal';
    routerEvents.next(new NavigationEnd(1, '/', '/terminal'));
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();

    expect(listMock).toHaveBeenCalledWith('.');
    expect(component.nodes.length).toBe(2);
  });
});
