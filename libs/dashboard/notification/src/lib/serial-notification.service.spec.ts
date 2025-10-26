import { TestBed } from '@angular/core/testing';
import { WEB_SERIAL } from '@dashboard/constants';
import { NotificationService } from './notification.service';
import { SerialNotificationService } from './serial-notification.service';

describe('SerialNotificationService', () => {
  let service: SerialNotificationService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SerialNotificationService,
        { provide: NotificationService, useValue: spy },
      ],
    });

    service = TestBed.inject(SerialNotificationService);
    notificationSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should notify connection success', () => {
    service.notifyConnectionSuccess();
    expect(notificationSpy.success).toHaveBeenCalled();
  });

  it('should notify connection error with Pi Zero error', () => {
    service.notifyConnectionError(WEB_SERIAL.RASPBERRY_PI.IS_NOT_ZERO);
    expect(notificationSpy.error).toHaveBeenCalled();
  });

  it('should notify read error', () => {
    const error = new Error('Read failed');
    service.notifyReadError(error);
    expect(notificationSpy.error).toHaveBeenCalledWith(
      'Read Error',
      'Read failed'
    );
  });

  it('should notify write error', () => {
    const error = new Error('Write failed');
    service.notifyWriteError(error);
    expect(notificationSpy.error).toHaveBeenCalledWith(
      'Write Error',
      'Write failed'
    );
  });
});
