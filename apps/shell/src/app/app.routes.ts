import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@ngx/portal').then(m => m.PortalModule)
  }
];