import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let routerEventsSubject: Subject<any>;

    beforeEach(() => {
        routerEventsSubject = new Subject();

        // mock global ga function
        (window as any).ga = () => {};

        TestBed.configureTestingModule({
            declarations: [AppComponent],
            providers: [
                {
                    provide: Router,
                    useValue: {
                        events: routerEventsSubject.asObservable(),
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
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe from router events on destroy', () => {
        const unsubSpy = spyOn((component as any).routerSub, 'unsubscribe');

        component.ngOnDestroy();

        expect(unsubSpy).toHaveBeenCalled();
    });
});
