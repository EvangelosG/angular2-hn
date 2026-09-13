import { TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  it('renders the loading indicator', async () => {
    await TestBed.configureTestingModule({ imports: [LoaderComponent] }).compileComponents();
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.loading-section .loader')?.textContent?.trim()).toBe('Loading...');
  });
});
