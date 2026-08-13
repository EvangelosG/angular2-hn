import { TestBed, async } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent]
    }).compileComponents();
  }));

  it('renders the provided message', () => {
    const fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.strong').textContent).toContain(
      'Could not load news stories.'
    );
  });
});
