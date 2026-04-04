/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { LeftSidebarComponent } from './left-sidebar.component';

describe('LeftSidebarComponent', () => {
  let component: LeftSidebarComponent;
  let fixture: ComponentFixture<LeftSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftSidebarComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(LeftSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleLeftSidebar when the panel toggle is clicked', () => {
    const emitSpy = vi.spyOn(component.toggleLeftSidebar, 'emit');
    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[mat-icon-button]');

    button?.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should not render file tree when left nav is closed', () => {
    fixture.componentRef.setInput('leftNavOpen', false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('lib-file-tree-feature'),
    ).toBeNull();
  });
});
