import { NgModule } from '@angular/core';
import { CommentPipe } from './comment.pipe';

/**
 * Thin facade around the standalone CommentPipe so NgModule-based
 * consumers keep working. Import the pipe directly where possible.
 */
@NgModule({
  imports: [CommentPipe],
  exports: [CommentPipe]
})
export class PipesModule {}
