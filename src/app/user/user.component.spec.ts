import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let paramMap$: Subject<ReturnType<typeof convertToParamMap>>;
  let fetchUser: ReturnType<typeof vi.fn>;
  let back: ReturnType<typeof vi.fn>;

  const testUser = {
    id: 'pg',
    karma: 1000,
    created: '2 years ago',
    about: '<b>hello</b>'
  } as User;

  beforeEach(async () => {
    paramMap$ = new Subject();
    fetchUser = vi.fn();
    back = vi.fn();

    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: HackerNewsAPIService, useValue: { fetchUser } },
        { provide: Location, useValue: { back } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the loader until a user or an error arrives', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-loader')).not.toBeNull();
    expect(el.querySelector('app-error-message')).toBeNull();
    expect(el.querySelector('.profile')).toBeNull();
  });

  it('renders the profile for the route id', () => {
    fetchUser.mockReturnValue(of(testUser));
    paramMap$.next(convertToParamMap({ id: 'pg' }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user()).toEqual(testUser);
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('.name')?.textContent).toBe('pg');
    expect(el.querySelector('.right')?.textContent).toContain('1000');
    expect(el.querySelector('.other-details b')?.textContent).toBe('hello');
  });

  it('shows an error message when the user cannot be loaded', () => {
    fetchUser.mockReturnValue(throwError(() => new Error('boom')));
    paramMap$.next(convertToParamMap({ id: 'nobody' }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(component.user()).toBeNull();
    expect(component.errorMessage()).toBe('Could not load user nobody.');
    expect(el.querySelector('app-loader')).toBeNull();
    expect(el.querySelector('app-error-message')).not.toBeNull();
  });

  it('keeps showing the previous user while a new id is being fetched', () => {
    fetchUser.mockReturnValue(of(testUser));
    paramMap$.next(convertToParamMap({ id: 'pg' }));
    fixture.detectChanges();

    fetchUser.mockReturnValue(new Subject<User>());
    paramMap$.next(convertToParamMap({ id: 'dang' }));
    fixture.detectChanges();

    expect(fetchUser).toHaveBeenLastCalledWith('dang');
    expect(component.user()).toEqual(testUser);
    expect(fixture.nativeElement.querySelector('.profile')).not.toBeNull();
  });

  it('navigates back when the back button is used', () => {
    fetchUser.mockReturnValue(of(testUser));
    paramMap$.next(convertToParamMap({ id: 'pg' }));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.back-button') as HTMLElement).click();
    expect(back).toHaveBeenCalledTimes(1);
  });
});
