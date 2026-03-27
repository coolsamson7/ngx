import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicPortalComponent } from './public-portal-component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PublicPortalRouterModule } from './public-portal-router.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,

    PublicPortalComponent,

    RouterOutlet,
    RouterLink,

    PublicPortalRouterModule,
  ],
  providers: [],
})
export class PublicPortalModule {}
