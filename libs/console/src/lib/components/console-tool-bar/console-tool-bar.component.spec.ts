import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleToolBarComponent } from './console-tool-bar.component';

describe('ConsoleToolBarComponent', () => {
  let component: ConsoleToolBarComponent;
  let fixture: ComponentFixture<ConsoleToolBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleToolBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleToolBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

