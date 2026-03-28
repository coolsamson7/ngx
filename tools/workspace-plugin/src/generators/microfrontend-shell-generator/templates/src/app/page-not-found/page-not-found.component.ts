import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractFeature, Feature } from '@ngx/portal';

@Component({
  selector: 'page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
@Feature({
  id: "**",
  label: "Page not found",
  icon: "language"
})
export class PageNotFoundComponent extends AbstractFeature {
  // constructor

  constructor(injector: Injector, router: Router) {
    super(injector)
  }
}
