import { TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  it('renders the message input', async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.componentRef.setInput('message', 'Something went wrong');
    fixture.detectChanges();

    const strong: HTMLElement = fixture.nativeElement.querySelector('p.strong');
    expect(strong.textContent.trim()).toBe('Something went wrong');
  });
});
