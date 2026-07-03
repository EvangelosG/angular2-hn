import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockApiService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = [
        {
            id: 1, title: 'Test Story 1', points: 10, user: 'user1', time: 0,
            time_ago: 0, type: 'story', url: 'http://test.com', domain: 'test.com',
            comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false,
        },
        {
            id: 2, title: 'Test Story 2', points: 20, user: 'user2', time: 0,
            time_ago: 0, type: 'story', url: 'http://test2.com', domain: 'test2.com',
            comments: [], comments_count: 10, poll: [], poll_votes_count: 0, deleted: false, dead: false,
        },
    ];

    beforeEach(() => {
        mockApiService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockApiService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockApiService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' }),
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

    it('should load items on init', () => {
        fixture.detectChanges();
        expect(component.items).toEqual(mockStories);
        expect(component.feedType).toBe('news');
        expect(component.pageNum).toBe(1);
    });

    it('should set listStart based on page number', () => {
        fixture.detectChanges();
        expect(component.listStart).toBe(1);
    });

    it('should unsubscribe on destroy', () => {
        fixture.detectChanges();
        const typeSubSpy = spyOn(component.typeSub, 'unsubscribe');
        const pageSubSpy = spyOn(component.pageSub, 'unsubscribe');
        component.ngOnDestroy();
        expect(typeSubSpy).toHaveBeenCalled();
        expect(pageSubSpy).toHaveBeenCalled();
    });

    it('should have a trackByItemId function', () => {
        const story = mockStories[0];
        expect(component.trackByItemId(0, story)).toBe(1);
    });
});
