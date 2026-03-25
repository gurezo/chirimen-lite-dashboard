import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleShellStore } from '@libs-console-shell-util';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectPageComponent } from './connect-page.component';

describe('ConnectPageComponent', () => {
  let component: ConnectPageComponent;
  let fixture: ComponentFixture<ConnectPageComponent>;
  let storeSelect: ReturnType<typeof vi.fn>;
  let storeDispatch: ReturnType<typeof vi.fn>;
  let setConnected: ReturnType<typeof vi.fn>;
  let connected$: BehaviorSubject<boolean>;

  beforeEach(async () => {
    connected$ = new BehaviorSubject<boolean>(false);
    storeSelect = vi.fn().mockReturnValue(connected$);
    storeDispatch = vi.fn();
    setConnected = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ConnectPageComponent],
      providers: [
        {
          provide: Store,
          useValue: { select: storeSelect, dispatch: storeDispatch },
        },
        {
          provide: ConsoleShellStore,
          useValue: { setConnected },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call store.select for webSerial.isConnected', () => {
    expect(storeSelect).toHaveBeenCalled();
  });

  it('should dispatch WebSerialActions.onConnect when onConnect is called', () => {
    component.onConnect();
    expect(storeDispatch).toHaveBeenCalledTimes(1);
  });

  it('should call shellStore.setConnected(true) when connected', () => {
    connected$.next(true);
    expect(setConnected).toHaveBeenCalledWith(true);
  });

  it('should not call shellStore.setConnected when disconnected', () => {
    expect(setConnected).not.toHaveBeenCalled();
  });
});
