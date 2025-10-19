import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I2cdetectComponent } from './i2cdetect.component';

describe('I2cdetectComponent', () => {
  let component: I2cdetectComponent;
  let fixture: ComponentFixture<I2cdetectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I2cdetectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(I2cdetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
