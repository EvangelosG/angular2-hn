import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Comment } from '../../shared/models/comment';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent {
  @Input() comment: Comment;
  collapse = false;

  trackByCommentId(index: number, comment: Comment): number {
    return comment.id;
  }
}
