/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteRunButtonComponent } from './remote-run-button.component';

describe('RemoteRunButtonComponent', () => {
  let component: RemoteRunButtonComponent;
  let fixture: ComponentFixture<RemoteRunButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteRunButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteRunButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
