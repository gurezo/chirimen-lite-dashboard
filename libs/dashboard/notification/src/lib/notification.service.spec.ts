import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'info',
      'warning',
    ]);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ToastrService, useValue: spy },
      ],
    });

    service = TestBed.inject(NotificationService);
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call toastr.success', () => {
    service.success('Title', 'Message');
    expect(toastrSpy.success).toHaveBeenCalledWith('Message', 'Title');
  });

  it('should call toastr.error', () => {
    service.error('Title', 'Message');
    expect(toastrSpy.error).toHaveBeenCalledWith('Message', 'Title');
  });

  it('should call toastr.info', () => {
    service.info('Title', 'Message');
    expect(toastrSpy.info).toHaveBeenCalledWith('Message', 'Title');
  });

  it('should call toastr.warning', () => {
    service.warning('Title', 'Message');
    expect(toastrSpy.warning).toHaveBeenCalledWith('Message', 'Title');
  });
});

