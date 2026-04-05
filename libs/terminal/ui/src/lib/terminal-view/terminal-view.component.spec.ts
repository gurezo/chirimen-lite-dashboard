import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PiZeroSerialBootstrapService,
  SerialFacadeService,
} from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';
import { TerminalCommandRequestService } from '@libs-terminal-util';
import { TerminalViewComponent } from './terminal-view.component';

describe('TerminalViewComponent', () => {
  let fixture: ComponentFixture<TerminalViewComponent>;
  let execMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    execMock = vi.fn().mockResolvedValue({
      stdout: `i2cdetect -y 1\n     0  1\n${PI_ZERO_PROMPT} `,
    });
    await TestBed.configureTestingModule({
      imports: [TerminalViewComponent],
    })
      .overrideProvider(SerialFacadeService, {
        useValue: {
          isConnected: () => true,
          exec: execMock,
          connectionEstablished$: NEVER,
          getConnectionEpoch: () => 1,
        },
      })
      .overrideProvider(PiZeroSerialBootstrapService, {
        useValue: {
          runAfterConnect: vi.fn().mockResolvedValue(undefined),
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TerminalViewComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('runs toolbar-requested commands via serial exec', async () => {
    const requests = TestBed.inject(TerminalCommandRequestService);
    requests.requestCommand('i2cdetect -y 1');

    await vi.waitFor(() => {
      expect(execMock).toHaveBeenCalledWith(
        'i2cdetect -y 1',
        PI_ZERO_PROMPT,
        10000,
        0,
      );
    });
  });
});
