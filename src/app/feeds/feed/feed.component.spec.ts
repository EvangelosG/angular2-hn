import { Story } from '../../shared/models/story';
import { FeedComponent } from './feed.component';

describe('FeedComponent filtering', () => {
  let component: FeedComponent;

  const story = (title: string, domain?: string): Story => {
    const s = new Story();
    s.title = title;
    s.domain = domain;
    return s;
  };

  beforeEach(() => {
    // The filtering logic under test does not touch the injected
    // service or route, so plain stubs are sufficient here.
    component = new FeedComponent({} as any, {} as any);
    component.items = [
      story('Introducing a new Token standard', 'github.com'),
      story('Angular 9 released', 'angular.io'),
      story('Why JavaScript wins', 'medium.com')
    ];
  });

  it('should return all items when the search term is empty', () => {
    component.searchTerm = '';
    expect(component.filteredItems.length).toBe(3);
    expect(component.hasActiveSearch).toBe(false);
  });

  it('should return only the matching story by title', () => {
    component.searchTerm = 'Token';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].title).toContain('Token');
    expect(component.hasActiveSearch).toBe(true);
  });

  it('should match case-insensitively', () => {
    component.searchTerm = 'javascript';
    const lower = component.filteredItems.length;
    component.searchTerm = 'JAVASCRIPT';
    expect(component.filteredItems.length).toBe(lower);
    expect(lower).toBe(1);
  });

  it('should match by domain', () => {
    component.searchTerm = 'github.com';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].domain).toBe('github.com');
  });

  it('should return an empty list when nothing matches', () => {
    component.searchTerm = 'xyz123nonexistent';
    expect(component.filteredItems.length).toBe(0);
    expect(component.hasActiveSearch).toBe(true);
  });

  it('should ignore surrounding whitespace in the search term', () => {
    component.searchTerm = '   angular   ';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].title).toContain('Angular');
  });

  it('should return an empty list before items load', () => {
    component.items = undefined;
    component.searchTerm = 'token';
    expect(component.filteredItems).toEqual([]);
  });

  it('should update the search term via onSearch', () => {
    component.onSearch('token');
    expect(component.searchTerm).toBe('token');
  });
});
