import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@libs-dialogs-util';
import { ConsoleShellStore } from '@libs-console-shell-util';
import {
  isConnected,
  selectConnectionMessage,
  selectErrorMessage,
} from '@libs-web-serial-state';
import { Store } from '@ngrx/store';
import { SerialNotificationService } from '@libs-web-serial-data-access';
import { TerminalCommandRequestService } from '@libs-terminal-util';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleShellComponent } from './console-shell.component';

describe('ConsoleShellComponent', () => {
  let component: ConsoleShellComponent;
  let fixture: ComponentFixture<ConsoleShellComponent>;
  let storeSelect: ReturnType<typeof vi.fn>;
  let storeDispatch: ReturnType<typeof vi.fn>;
  let notifyConnectionSuccess: ReturnType<typeof vi.fn>;
  let notifyConnectionError: ReturnType<typeof vi.fn>;
  let openDialog: ReturnType<typeof vi.fn>;
  let closeAllDialog: ReturnType<typeof vi.fn>;
  let setActivePanel: ReturnType<typeof vi.fn>;
  let closeDialog: ReturnType<typeof vi.fn>;
  let openShellDialog: ReturnType<typeof vi.fn>;
  let requestTerminalCommand: ReturnType<typeof vi.fn>;
  let isConnected$: BehaviorSubject<boolean>;
  let applyConnectedLayout: ReturnType<typeof vi.fn>;
  let resetLayoutAfterDisconnect: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let activatedRouteMock: ActivatedRoute;

  beforeEach(async () => {
    navigateSpy = vi.fn().mockResolvedValue(true);
    activatedRouteMock = {
      firstChild: { snapshot: { url: [{ path: 'terminal' }] } },
    } as unknown as ActivatedRoute;
    isConnected$ = new BehaviorSubject(false);
    applyConnectedLayout = vi.fn();
    resetLayoutAfterDisconnect = vi.fn();
    storeSelect = vi.fn((selector: unknown) => {
      if (selector === selectConnectionMessage) return of('');
      if (selector === selectErrorMessage) return of('');
      if (selector === isConnected) return isConnected$.asObservable();
      return isConnected$.asObservable();
    });
    storeDispatch = vi.fn();

    notifyConnectionSuccess = vi.fn();
    notifyConnectionError = vi.fn();
    openDialog = vi.fn().mockReturnValue({ closed: of(undefined) });
    closeAllDialog = vi.fn();
    setActivePanel = vi.fn();
    closeDialog = vi.fn();
    openShellDialog = vi.fn();
    requestTerminalCommand = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ConsoleShellComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigate: navigateSpy, events: EMPTY },
        },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        {
          provide: Store,
          useValue: { select: storeSelect, dispatch: storeDispatch },
        },
        {
          provide: SerialNotificationService,
          useValue: {
            notifyConnectionSuccess,
            notifyConnectionError,
          },
        },
        {
          provide: DialogService,
          useValue: { open: openDialog, closeAll: closeAllDialog },
        },
        {
          provide: ConsoleShellStore,
          useValue: {
            activePanel: () => 'terminal',
            activeDialog: () => 'none',
            selectedFilePath: () => null,
            leftNavOpen: () => true,
            rightNavOpen: () => true,
            setActivePanel,
            toggleLeftNav: vi.fn(),
            toggleRightNav: vi.fn(),
            openDialog: openShellDialog,
            closeDialog,
            applyConnectedLayout,
            resetLayoutAfterDisconnect,
          },
        },
        {
          provide: TerminalCommandRequestService,
          useValue: { requestCommand: requestTerminalCommand },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch init on ngOnInit', () => {
    expect(storeDispatch).toHaveBeenCalled();
  });

  it('should dispatch onConnect when onConnect is called', () => {
    storeDispatch.mockClear();
    component.onConnect();
    expect(storeDispatch).toHaveBeenCalledTimes(1);
  });

  it('should dispatch onDisConnect when onDisConnect is called', () => {
    storeDispatch.mockClear();
    component.onDisConnect();
    expect(storeDispatch).toHaveBeenCalledTimes(1);
  });

  it('should switch pane when editor action is clicked', () => {
    component.onToolbarAction('editor');

    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(closeAllDialog).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['editor'], {
      relativeTo: activatedRouteMock,
    });
  });

  it('should navigate to wifi when wifi action is clicked', () => {
    component.onToolbarAction('wifi');

    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(closeAllDialog).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['wifi'], {
      relativeTo: activatedRouteMock,
    });
    expect(openShellDialog).not.toHaveBeenCalled();
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('should request i2cdetect in terminal when i2c action is clicked', () => {
    component.onToolbarAction('i2c');

    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(closeAllDialog).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['terminal'], {
      relativeTo: activatedRouteMock,
    });
    expect(requestTerminalCommand).toHaveBeenCalledWith('i2cdetect -y 1');
    expect(openShellDialog).not.toHaveBeenCalled();
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('should set grid template columns with fixed diagram width when right nav is open', () => {
    expect(component.gridTemplateColumns()).toBe(
      '280px minmax(0, 1fr) calc(48px + 300px)',
    );
  });

  it('should apply connected layout when isConnected becomes true', () => {
    navigateSpy.mockClear();
    applyConnectedLayout.mockClear();
    isConnected$.next(true);
    expect(applyConnectedLayout).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['terminal'], {
      relativeTo: activatedRouteMock,
    });
  });

  it('should reset layout when isConnected becomes false after connected', () => {
    isConnected$.next(true);
    navigateSpy.mockClear();
    resetLayoutAfterDisconnect.mockClear();
    isConnected$.next(false);
    expect(resetLayoutAfterDisconnect).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['terminal'], {
      relativeTo: activatedRouteMock,
    });
  });
});

describe('ConsoleShellComponent gridTemplateColumns when right nav closed', () => {
  let component: ConsoleShellComponent;
  let fixture: ComponentFixture<ConsoleShellComponent>;
  let storeSelect: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const isConnected$ = new BehaviorSubject(false);
    const activatedRoute = {
      firstChild: { snapshot: { url: [{ path: 'terminal' }] } },
    } as unknown as ActivatedRoute;
    storeSelect = vi.fn((selector: unknown) => {
      if (selector === selectConnectionMessage) return of('');
      if (selector === selectErrorMessage) return of('');
      if (selector === isConnected) return isConnected$.asObservable();
      return isConnected$.asObservable();
    });

    await TestBed.configureTestingModule({
      imports: [ConsoleShellComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true), events: EMPTY },
        },
        { provide: ActivatedRoute, useValue: activatedRoute },
        {
          provide: Store,
          useValue: { select: storeSelect, dispatch: vi.fn() },
        },
        {
          provide: SerialNotificationService,
          useValue: {
            notifyConnectionSuccess: vi.fn(),
            notifyConnectionError: vi.fn(),
          },
        },
        {
          provide: DialogService,
          useValue: { open: vi.fn(), closeAll: vi.fn() },
        },
        {
          provide: ConsoleShellStore,
          useValue: {
            activePanel: () => 'terminal',
            activeDialog: () => 'none',
            selectedFilePath: () => null,
            leftNavOpen: () => true,
            rightNavOpen: () => false,
            setActivePanel: vi.fn(),
            toggleLeftNav: vi.fn(),
            toggleRightNav: vi.fn(),
            openDialog: vi.fn(),
            closeDialog: vi.fn(),
            applyConnectedLayout: vi.fn(),
            resetLayoutAfterDisconnect: vi.fn(),
          },
        },
        {
          provide: TerminalCommandRequestService,
          useValue: { requestCommand: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set grid template columns with collapsed rail width when right nav is closed', () => {
    expect(component.gridTemplateColumns()).toBe('280px minmax(0, 1fr) 48px');
  });
});

describe('ConsoleShellComponent layout DOM (connected vs disconnected)', () => {
  let fixture: ComponentFixture<ConsoleShellComponent>;
  let isConnected$: BehaviorSubject<boolean>;
  let storeSelect: ReturnType<typeof vi.fn>;
  let storeDispatch: ReturnType<typeof vi.fn>;
  let activatedRouteMock: ActivatedRoute;

  beforeEach(async () => {
    activatedRouteMock = {
      firstChild: { snapshot: { url: [{ path: 'terminal' }] } },
    } as unknown as ActivatedRoute;
    isConnected$ = new BehaviorSubject(false);
    storeSelect = vi.fn((selector: unknown) => {
      if (selector === selectConnectionMessage) return of('');
      if (selector === selectErrorMessage) return of('');
      if (selector === isConnected) return isConnected$.asObservable();
      return isConnected$.asObservable();
    });
    storeDispatch = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ConsoleShellComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true),
            events: EMPTY,
          },
        },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        ConsoleShellStore,
        {
          provide: Store,
          useValue: { select: storeSelect, dispatch: storeDispatch },
        },
        {
          provide: SerialNotificationService,
          useValue: {
            notifyConnectionSuccess: vi.fn(),
            notifyConnectionError: vi.fn(),
          },
        },
        {
          provide: DialogService,
          useValue: { open: vi.fn(), closeAll: vi.fn() },
        },
        {
          provide: TerminalCommandRequestService,
          useValue: { requestCommand: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleShellComponent);
    fixture.detectChanges();
  });

  it('shows connect page and hides three-pane shell and breadcrumb when disconnected', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('lib-connect-page')).toBeTruthy();
    expect(fixture.debugElement.query(By.css('lib-header-toolbar'))).toBeTruthy();
    expect(root.querySelector('lib-breadcrumb')).toBeNull();
    expect(root.querySelector('lib-left-sidebar')).toBeNull();
    expect(root.querySelector('router-outlet')).toBeNull();
  });

  it('shows toolbar, breadcrumb, three panes, and router outlet after connect', () => {
    isConnected$.next(true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('lib-connect-page')).toBeNull();
    expect(fixture.debugElement.query(By.css('lib-header-toolbar'))).toBeTruthy();
    expect(root.querySelector('lib-breadcrumb')).toBeTruthy();
    expect(root.querySelector('lib-left-sidebar')).toBeTruthy();
    expect(root.querySelector('router-outlet')).toBeTruthy();
    expect(root.querySelector('lib-right-sidebar')).toBeTruthy();
  });

  it('keeps right sidebar mounted when right nav is collapsed after connect', () => {
    isConnected$.next(true);
    fixture.detectChanges();

    const shellStore = TestBed.inject(ConsoleShellStore);
    shellStore.closeRightNav();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('lib-right-sidebar')).toBeTruthy();
    expect(root.querySelector('choh-pin-assign')).toBeNull();
  });

  it('resets active panel to terminal when connection becomes true', () => {
    const shellStore = TestBed.inject(ConsoleShellStore);
    shellStore.setActivePanel('editor');

    isConnected$.next(true);
    fixture.detectChanges();

    expect(shellStore.activePanel()).toBe('terminal');
  });
});