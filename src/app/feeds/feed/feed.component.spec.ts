import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let paramsSubject: Subject<any>;
    let dataSubject: Subject<any>;

    beforeEach(() => {
        paramsSubject = new Subject();
        dataSubject = new Subject();

        TestBed.configureTestingModule({
            declarations: [FeedComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: paramsSubject.asObservable(),
                        data: dataSubject.asObservable(),
                    },
                },
                {
                    provide: HackerNewsAPIService,
                    useValue: {
                        fetchFeed: () => of([]),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe from route subscriptions on destroy', () => {
        component.ngOnInit();

        expect(component.typeSub).toBeDefined();
        expect(component.pageSub).toBeDefined();

        spyOn(component.typeSub, 'unsubscribe');
        spyOn(component.pageSub, 'unsubscribe');

        component.ngOnDestroy();

        expect(component.typeSub.unsubscribe).toHaveBeenCalled();
        expect(component.pageSub.unsubscribe).toHaveBeenCalled();
    });

    it('should not throw if ngOnDestroy is called before ngOnInit', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
