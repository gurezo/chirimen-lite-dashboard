import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PinAssignPanelComponent } from './pin-assign-panel.component';

describe('PinAssignPanelComponent', () => {
  let component: PinAssignPanelComponent;
  let fixture: ComponentFixture<PinAssignPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinAssignPanelComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PinAssignPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have displayedColumns for Now Running, App Name, Select', () => {
    expect(component.displayedColumns).toEqual([
      'Now Running',
      'App Name',
      'Select',
    ]);
  });

  it('should render table with dataSource rows', () => {
    expect(component.dataSource.length).toBe(4);
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(4);
  });

  it('should expose table as viewChild signal', () => {
    expect(component.table).toBeDefined();
    expect(typeof component.table).toBe('function');
  });
});
