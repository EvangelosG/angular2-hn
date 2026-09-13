import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

/**
 * Thin facade over the standalone core components so existing NgModule
 * consumers keep working. Prefer importing the components directly.
 */
@NgModule({
  imports: [HeaderComponent, FooterComponent, SettingsComponent],
  exports: [HeaderComponent, FooterComponent]
})
export class CoreModule { }
