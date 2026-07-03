import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;

    const mockStory: Story = {
        id: 1,
        title: 'Test Story',
        points: 10,
        user: 'testuser',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [SettingsService],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = mockStory;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should detect http URLs', () => {
        component.item = { ...mockStory, url: 'https://example.com' };
        expect(component.hasUrl).toBe(true);
    });

    it('should detect non-http URLs', () => {
        component.item = { ...mockStory, url: 'item?id=123' };
        expect(component.hasUrl).toBe(false);
    });

    it('should detect http (non-https) URLs', () => {
        component.item = { ...mockStory, url: 'http://example.com' };
        expect(component.hasUrl).toBe(true);
    });
});
