import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from '@libs-dialogs-util';
import { ConsoleShellStore } from '@libs-console-shell-util';
import { Store } from '@ngrx/store';
import { SerialNotificationService } from '@libs-web-serial-data-access';
import { TerminalCommandRequestService } from '@libs-terminal-util';
import { of } from 'rxjs';
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

  beforeEach(async () => {
    storeSelect = vi
      .fn()
      .mockReturnValueOnce(of(false))
      .mockReturnValueOnce(of(''))
      .mockReturnValueOnce(of(''))
      .mockReturnValueOnce(of(false));
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
        provideRouter([]),
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
            rightNavOpen: () => true,
            setActivePanel,
            toggleRightNav: vi.fn(),
            openDialog: openShellDialog,
            closeDialog,
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
    expect(setActivePanel).toHaveBeenCalledWith('editor');
  });

  it('should open dialog when wifi action is clicked', () => {
    component.onToolbarAction('wifi');

    expect(openShellDialog).toHaveBeenCalledWith('wifi');
    expect(openDialog).toHaveBeenCalledTimes(1);
  });

  it('should request i2cdetect in terminal when i2c action is clicked', () => {
    component.onToolbarAction('i2c');

    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(closeAllDialog).toHaveBeenCalledTimes(1);
    expect(setActivePanel).toHaveBeenCalledWith('terminal');
    expect(requestTerminalCommand).toHaveBeenCalledWith('i2cdetect -y 1');
    expect(openShellDialog).not.toHaveBeenCalled();
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('should set grid template columns with fixed right pane when right nav is open', () => {
    expect(component.gridTemplateColumns()).toBe('280px minmax(0, 1fr) 96px');
  });
});

describe('ConsoleShellComponent gridTemplateColumns when right nav closed', () => {
  let component: ConsoleShellComponent;
  let fixture: ComponentFixture<ConsoleShellComponent>;
  let storeSelect: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    storeSelect = vi
      .fn()
      .mockReturnValueOnce(of(false))
      .mockReturnValueOnce(of(''))
      .mockReturnValueOnce(of(''))
      .mockReturnValueOnce(of(false));

    await TestBed.configureTestingModule({
      imports: [ConsoleShellComponent],
      providers: [
        provideRouter([]),
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
            rightNavOpen: () => false,
            setActivePanel: vi.fn(),
            toggleRightNav: vi.fn(),
            openDialog: vi.fn(),
            closeDialog: vi.fn(),
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

  it('should set grid template columns with 0px right track when right nav is closed', () => {
    expect(component.gridTemplateColumns()).toBe('280px minmax(0, 1fr) 0px');
  });
});