 
 
import {
  //AboutDialogService,
  AbstractFeature,
  Feature,
  FeatureData,
  FeatureRegistry,
  PortalManager
} from '@ngx/portal';
import {
  SessionManager,
  Ticket,
} from '@ngx/security';
import { Component, Injector } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar } from "@angular/material/toolbar";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { WithDialogs } from '@ngx/ui';
import { AvatarComponent } from '../avatar/avatar.component';
import { LocaleSwitchComponent } from '../locale/locale-switch.component';

@Feature({
  id: 'public-portal',
  i18n: ["shell", "portal"],
  visibility: ['public'],
  tags: ['portal'],
  router: {
    lazyModule: 'PublicPortalModule',
  },
})
@Component({
  selector: 'public-portal',
  templateUrl: './public-portal-component.html',
  styleUrls: ['./public-portal-component.scss'],
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbar, MatButtonModule, LocaleSwitchComponent],
})
export class PublicPortalComponent extends WithDialogs(AbstractFeature) {
  // instance data

  features: FeatureData[] = [];

  // constructor

  constructor(
    injector: Injector,
    private router: Router,
    private featureRegistry: FeatureRegistry,
    private sessionManager: SessionManager<any, Ticket>,
    private portalManager: PortalManager
  ) {
    super(injector);

    featureRegistry.registry$.subscribe((_) => this.computeNavigation());
  }

  // public

  about() {
      this.openDialog({
          title: "About",
          dialog: "about-dialog",
          buttons: ["ok"]
        }).subscribe(result => {
          console.log("Dialog result:", result)
        });
  }

  login() {
    this.sessionManager
      .openSession({
        user: 'Andreas Ernst',
        password: 'secret',
      })
      .subscribe(
        (session) => {
          this.portalManager
            .loadDeployment(true)
            .then((result) => this.router.navigate([this.router.url]));
        },
        (error) => {
          console.log(error);
        }
      );
  }

  // private

  private computeNavigation() {
    this.features = this.featureRegistry
      .finder()
      .withEnabled()
      .withTag('navigation')
      .find();
  }
}
