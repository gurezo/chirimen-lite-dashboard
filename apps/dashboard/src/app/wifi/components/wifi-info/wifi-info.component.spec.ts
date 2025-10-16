import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WifiInfoComponent } from './wifi-info.component';

describe('WifiInfoComponent', () => {
  let component: WifiInfoComponent;
  let fixture: ComponentFixture<WifiInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WifiInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WifiInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
