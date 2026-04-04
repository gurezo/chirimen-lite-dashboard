/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HeaderToolbarComponent } from './header-toolbar.component';

describe('HeaderToolbarComponent', () => {
  let component: HeaderToolbarComponent;
  let fixture: ComponentFixture<HeaderToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderToolbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderToolbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('connected$', of(false));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render toolbar row when disconnected', () => {
    expect(
      fixture.nativeElement.querySelector('button[aria-label="editor"]'),
    ).toBeNull();
  });

  it('should emit toolbarAction when action icon is clicked', () => {
    fixture.componentRef.setInput('connected$', of(true));
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.toolbarAction, 'emit');
    const editorButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[aria-label="editor"]');

    editorButton?.click();

    expect(emitSpy).toHaveBeenCalledWith('editor');
  });
});
