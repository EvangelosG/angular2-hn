import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let paramsSubject: Subject<any>;

    beforeEach(() => {
        paramsSubject = new Subject();

        TestBed.configureTestingModule({
            declarations: [ItemDetailsComponent],
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
                        fetchItemContent: () => of({ url: '', type: 'story', comments: [] }),
                    },
                },
                {
                    provide: SettingsService,
                    useValue: {
                        settings: {
                            showSettings: false,
                            openLinkInNewTab: false,
                            theme: 'default',
                            titleFontSize: '16',
                            listSpacing: '0',
                        },
                    },
                },
                {
                    provide: Location,
                    useValue: { back: () => {} },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemDetailsComponent);
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
