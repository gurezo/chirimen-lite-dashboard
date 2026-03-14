/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileTreeFeatureComponent } from './file-tree-feature.component';

describe('FileTreeFeatureComponent', () => {
  let component: FileTreeFeatureComponent;
  let fixture: ComponentFixture<FileTreeFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTreeFeatureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTreeFeatureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
