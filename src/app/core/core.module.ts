import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [HeaderComponent, FooterComponent, SettingsComponent],
  exports: [HeaderComponent, FooterComponent]
})
export class CoreModule { }
