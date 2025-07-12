import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChirimenSetupComponent } from './chirimen-setup.component';

describe('ChirimenSetupComponent', () => {
  let component: ChirimenSetupComponent;
  let fixture: ComponentFixture<ChirimenSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChirimenSetupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChirimenSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
