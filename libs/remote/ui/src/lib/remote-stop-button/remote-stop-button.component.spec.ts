import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteStopButtonComponent } from './remote-stop-button.component';

describe('RemoteStopButtonComponent', () => {
  let component: RemoteStopButtonComponent;
  let fixture: ComponentFixture<RemoteStopButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteStopButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteStopButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
