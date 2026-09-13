import { NgModule } from '@angular/core';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';

/**
 * Thin facade around the standalone shared components so NgModule-based
 * consumers keep working. Import the components directly where possible.
 */
@NgModule({
  imports: [LoaderComponent, ErrorMessageComponent],
  exports: [LoaderComponent, ErrorMessageComponent]
})
export class SharedComponentsModule {}
