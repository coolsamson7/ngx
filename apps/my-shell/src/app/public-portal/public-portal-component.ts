 
 
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

@Feature({
  id: 'public-portal',
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
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbar, MatButtonModule],
})
export class PublicPortalComponent extends AbstractFeature {
  // instance data

  features: FeatureData[] = [];

  // constructor

  constructor(
    injector: Injector,
    //private aboutDialogService: AboutDialogService,
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
    //this.aboutDialogService.show();
  }

  login() {
    this.sessionManager
      .openSession({
        user: 'admin',
        password: 'admin',
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
