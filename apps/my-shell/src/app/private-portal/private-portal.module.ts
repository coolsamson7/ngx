import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivatePortalComponent } from './private-portal-component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PrivatePortalRouterModule } from './private-portal-router.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,

    RouterOutlet,
    RouterLink,

    PrivatePortalComponent,

    PrivatePortalRouterModule,
  ],
  providers: [],
})
export class PrivatePortalModule {}
