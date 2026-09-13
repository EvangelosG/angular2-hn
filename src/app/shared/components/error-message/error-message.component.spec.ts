import { TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ErrorMessageComponent] }).compileComponents();
  });

  it('renders the bound message', () => {
    const fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.componentRef.setInput('message', 'Could not load news stories.');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('p.strong')?.textContent?.trim()).toBe('Could not load news stories.');
    expect(element.querySelector('.skull')).not.toBeNull();
  });

  it('defaults to an empty message', () => {
    const fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.message()).toBe('');
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('p.strong')?.textContent?.trim()).toBe('');
  });
});
