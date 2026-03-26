import { Route } from '@angular/router';
import { loadRemoteModule } from '@nx/module-federation/angular';

import { loadRemoteModule } from '@nx/module-federation/angular';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'microfrontend' },
  {
    path: 'microfrontend',
    loadChildren: () =>
      loadRemoteModule('microfrontend', './Module').then(m => m.PortalModule)
  }
];