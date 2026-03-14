import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectPageComponent } from './connect-page.component';

describe('ConnectPageComponent', () => {
  let component: ConnectPageComponent;
  let fixture: ComponentFixture<ConnectPageComponent>;
  let storeSelect: ReturnType<typeof vi.fn>;
  let storeDispatch: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    storeSelect = vi.fn().mockReturnValue(of(false));
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
});
