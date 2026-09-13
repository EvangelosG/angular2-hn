import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Comment } from '../../shared/models/comment';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
  imports: [RouterLink, RouterLinkActive]
})
export class CommentComponent {
  readonly comment = input.required<Comment>();
  readonly collapse = signal(false);

  toggleCollapse() {
    this.collapse.update(collapsed => !collapsed);
  }
}
