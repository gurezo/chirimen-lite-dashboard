import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibsConnectFeatureComponent } from './libs-connect-feature.component';

describe('LibsConnectFeatureComponent', () => {
  let component: LibsConnectFeatureComponent;
  let fixture: ComponentFixture<LibsConnectFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibsConnectFeatureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibsConnectFeatureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
