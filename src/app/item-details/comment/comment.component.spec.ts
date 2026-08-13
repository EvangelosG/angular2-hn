import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  function createComment(comment: Partial<Comment>) {
    const fixture = TestBed.createComponent(CommentComponent);
    fixture.componentInstance.comment = { comments: [], ...comment } as Comment;
    fixture.detectChanges();
    return fixture;
  }

  it('renders the comment content', () => {
    const fixture = createComment({ user: 'pg', time_ago: '1 hour ago', content: '<p>hello</p>' });

    expect(fixture.componentInstance.collapse).toBe(false);
    expect(fixture.nativeElement.querySelector('.comment-text').textContent).toContain('hello');
  });

  it('renders a placeholder for deleted comments', () => {
    const fixture = createComment({ deleted: true });

    expect(fixture.nativeElement.querySelector('.deleted-meta')).toBeTruthy();
  });
});
