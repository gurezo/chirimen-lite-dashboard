import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileNameDisplayComponent } from './file-name-display.component';

describe('FileNameDisplayComponent', () => {
  let component: FileNameDisplayComponent;
  let fixture: ComponentFixture<FileNameDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileNameDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileNameDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
