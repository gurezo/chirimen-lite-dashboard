import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from '@libs-dialogs-util';
import { WifiPageComponent } from './wifi-page.component';

describe('WifiPageComponent', () => {
  let component: WifiPageComponent;
  let fixture: ComponentFixture<WifiPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WifiPageComponent],
      providers: [
        { provide: DialogService, useValue: { close: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WifiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
