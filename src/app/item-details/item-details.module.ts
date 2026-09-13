import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { ITEM_DETAILS_ROUTES } from './item-details.routes';

/**
 * Thin facade over the standalone item-details components.
 * The app route still lazy-loads this module; consumers can switch to
 * `loadChildren: () => import('./item-details/item-details.routes').then(m => m.ITEM_DETAILS_ROUTES)`.
 */
@NgModule({
  imports: [ ItemDetailsComponent, CommentComponent, RouterModule.forChild(ITEM_DETAILS_ROUTES) ],
  exports: [ ItemDetailsComponent, CommentComponent, RouterModule ]
})
export class ItemDetailsModule {}
