import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {
  transform(comment: number | null | undefined): string {
    if (comment != null && comment > 0) {
      const st = comment === 1 ? 'comment' : 'comments';
      return `${comment} ${st}`;
    }
    return 'discuss';
  }
}
