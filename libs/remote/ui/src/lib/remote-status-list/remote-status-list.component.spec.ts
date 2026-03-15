/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteStatusListComponent } from './remote-status-list.component';

describe('RemoteStatusListComponent', () => {
  let component: RemoteStatusListComponent;
  let fixture: ComponentFixture<RemoteStatusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteStatusListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteStatusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
