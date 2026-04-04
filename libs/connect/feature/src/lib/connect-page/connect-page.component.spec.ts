import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectPageComponent } from './connect-page.component';

describe('ConnectPageComponent', () => {
  let component: ConnectPageComponent;
  let fixture: ComponentFixture<ConnectPageComponent>;
  let storeSelect: ReturnType<typeof vi.fn>;
  let storeDispatch: ReturnType<typeof vi.fn>;
  let connected$: BehaviorSubject<boolean>;

  beforeEach(async () => {
    connected$ = new BehaviorSubject<boolean>(false);
    storeSelect = vi.fn().mockReturnValue(connected$);
    storeDispatch = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ConnectPageComponent],
      providers: [
        {
          provide: Store,
          useValue: { select: storeSelect, dispatch: storeDispatch },
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

  it('should map connectionStatus$ to disconnected when store is false', async () => {
    connected$.next(false);
    const status = await firstValueFrom(component.connectionStatus$);
    expect(status).toBe('disconnected');
  });

  it('should map connectionStatus$ to connected when store is true', async () => {
    connected$.next(true);
    const status = await firstValueFrom(component.connectionStatus$);
    expect(status).toBe('connected');
  });
});
