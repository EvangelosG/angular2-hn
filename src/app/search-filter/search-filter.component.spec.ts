import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SearchFilterComponent } from './search-filter.component';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build a feed-specific placeholder', () => {
    component.feedType = 'news';
    expect(component.placeholder).toBe('Search news stories...');
  });

  it('should fall back to a generic placeholder without a feed type', () => {
    component.feedType = '';
    expect(component.placeholder).toBe('Search stories...');
  });

  it('should emit the trimmed search term after the debounce window', fakeAsync(() => {
    const emitted: string[] = [];
    component.searchChange.subscribe(term => emitted.push(term));

    component.onInput('  Token  ');
    expect(emitted.length).toBe(0);

    tick(300);
    expect(emitted).toEqual(['Token']);
  }));

  it('should debounce rapid input and only emit the final value', fakeAsync(() => {
    const emitted: string[] = [];
    component.searchChange.subscribe(term => emitted.push(term));

    component.onInput('a');
    tick(100);
    component.onInput('ap');
    tick(100);
    component.onInput('app');
    tick(300);

    expect(emitted).toEqual(['app']);
  }));

  it('should report isSearching only when a non-empty term is present', () => {
    expect(component.isSearching).toBe(false);
    component.searchTerm = 'token';
    expect(component.isSearching).toBe(true);
    component.searchTerm = '   ';
    expect(component.isSearching).toBe(false);
  });

  it('should clear the term and emit an empty string immediately', () => {
    const emitted: string[] = [];
    component.searchChange.subscribe(term => emitted.push(term));

    component.searchTerm = 'token';
    component.clearSearch();

    expect(component.searchTerm).toBe('');
    expect(emitted).toEqual(['']);
  });

  it('should render a clear button only while a term is entered', () => {
    expect(fixture.debugElement.query(By.css('.clear-button'))).toBeNull();

    component.searchTerm = 'token';
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.clear-button'))).not.toBeNull();
  });
});
