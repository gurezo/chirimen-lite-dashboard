/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RightSidebarComponent } from './right-sidebar.component';

describe('RightSidebarComponent', () => {
  let component: RightSidebarComponent;
  let fixture: ComponentFixture<RightSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleRightSidebar when the panel toggle is clicked', () => {
    const emitSpy = vi.spyOn(component.toggleRightSidebar, 'emit');
    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[mat-icon-button]');

    button?.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should not render pin assign when right nav is closed', () => {
    fixture.componentRef.setInput('rightNavOpen', false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('choh-pin-assign'),
    ).toBeNull();
  });
});
