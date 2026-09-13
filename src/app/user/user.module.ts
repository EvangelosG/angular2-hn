import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { USER_ROUTES } from './user.routes';

/**
 * Thin facade kept for the lazy `loadChildren` call site in app.routes.ts.
 * Prefer `USER_ROUTES` from ./user.routes for standalone routing.
 */
@NgModule({
  imports: [UserComponent, RouterModule.forChild(USER_ROUTES)],
  exports: [UserComponent, RouterModule]
})
export class UserModule {}
