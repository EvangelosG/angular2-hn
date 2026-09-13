import { NgModule } from '@angular/core';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';

@NgModule({
  imports: [ LoaderComponent, ErrorMessageComponent ],
  exports: [ LoaderComponent, ErrorMessageComponent ]
})
export class SharedComponentsModule {}
