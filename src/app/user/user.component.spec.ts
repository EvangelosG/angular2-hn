import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let paramsSubject: Subject<any>;

    beforeEach(() => {
        paramsSubject = new Subject();

        TestBed.configureTestingModule({
            declarations: [UserComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: paramsSubject.asObservable(),
                    },
                },
                {
                    provide: HackerNewsAPIService,
                    useValue: {
                        fetchUser: () => of({ id: 'testuser' }),
                    },
                },
                {
                    provide: Location,
                    useValue: { back: () => {} },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe from route params on destroy', () => {
        component.ngOnInit();

        expect(component.sub).toBeDefined();

        const unsubSpy = spyOn(component.sub, 'unsubscribe');

        component.ngOnDestroy();

        expect(unsubSpy).toHaveBeenCalled();
    });

    it('should handle destroy before init gracefully', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
