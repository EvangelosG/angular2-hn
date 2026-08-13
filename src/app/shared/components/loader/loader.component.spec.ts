import { TestBed, async } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    }).compileComponents();
  }));

  it('renders', () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.children.length).toBeGreaterThan(0);
  });
});
