import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    level: 0,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    content: '<p>Hello</p>',
    deleted: false,
    comments: [],
    ...overrides
  };
}

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
  });

  it('renders the author, time and content', async () => {
    fixture.componentRef.setInput('comment', makeComment());
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.meta a')?.textContent).toBe('pg');
    expect(el.querySelector('.time')?.textContent).toBe('1 hour ago');
    expect(el.querySelector('.comment-text')?.innerHTML).toContain('Hello');
  });

  it('renders the deleted placeholder for deleted comments', async () => {
    fixture.componentRef.setInput('comment', makeComment({ deleted: true }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.deleted-meta')?.textContent).toContain('Comment Deleted');
    expect(el.querySelector('.meta')).toBeNull();
  });

  it('toggles collapse and hides the subtree while keeping it in the DOM', async () => {
    fixture.componentRef.setInput('comment', makeComment({
      comments: [makeComment({ id: 2, user: 'child' })]
    }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const toggle = el.querySelector<HTMLElement>('.collapse')!;
    const tree = el.querySelector<HTMLElement>('.comment-tree > div')!;

    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);
    expect(el.querySelectorAll('app-comment').length).toBe(1);

    toggle.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapse()).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(el.querySelector('.meta')?.classList.contains('meta-collapse')).toBe(true);
    expect(el.querySelectorAll('app-comment').length).toBe(1);

    toggle.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapse()).toBe(false);
    expect(tree.hidden).toBe(false);
  });
});
