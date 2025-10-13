import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChirimenPanelComponent } from './chirimen-panel.component';

describe('ChirimenPanelComponent', () => {
  let component: ChirimenPanelComponent;
  let fixture: ComponentFixture<ChirimenPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChirimenPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChirimenPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
