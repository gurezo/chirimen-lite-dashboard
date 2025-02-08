import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleContainersComponent } from './console-containers.component';

describe('ConsoleContainersComponent', () => {
  let component: ConsoleContainersComponent;
  let fixture: ComponentFixture<ConsoleContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleContainersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
