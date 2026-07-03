import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    const mockComment: Comment = {
        id: 1,
        level: 0,
        user: 'testuser',
        time: 1000,
        time_ago: '1 hour ago',
        content: '<p>Test comment</p>',
        deleted: false,
        comments: [],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = mockComment;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start with collapse set to false', () => {
        expect(component.collapse).toBe(false);
    });

    it('should have a trackByCommentId function', () => {
        expect(component.trackByCommentId(0, mockComment)).toBe(1);
    });

    it('should use OnPush change detection', () => {
        const metadata = fixture.componentRef.changeDetectorRef;
        expect(metadata).toBeDefined();
    });
});
