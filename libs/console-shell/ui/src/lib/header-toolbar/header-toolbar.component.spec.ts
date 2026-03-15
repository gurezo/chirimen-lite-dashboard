/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HeaderToolbarComponent } from './header-toolbar.component';

describe('HeaderToolbarComponent', () => {
  let component: HeaderToolbarComponent;
  let fixture: ComponentFixture<HeaderToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderToolbarComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderToolbarComponent);
    component = fixture.componentInstance;
    component.connected$ = of(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
