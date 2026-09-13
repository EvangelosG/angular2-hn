import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { ITEM_DETAILS_ROUTES } from './item-details.routes';

/**
 * Thin facade over the standalone item-details components so that
 * `loadChildren: () => import(...).then(m => m.ItemDetailsModule)` keeps working.
 */
@NgModule({
  imports: [ ItemDetailsComponent, CommentComponent, RouterModule.forChild(ITEM_DETAILS_ROUTES) ],
  exports: [ ItemDetailsComponent, CommentComponent, RouterModule ]
})
export class ItemDetailsModule {}
