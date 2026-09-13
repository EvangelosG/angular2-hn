import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('links to the GitHub project', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#footer a');
    expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
