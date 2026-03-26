import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    // Replace this with your actual entry component/module from libs/portal
    loadChildren: () =>
      import('@ngx/portal').then((m) => m.PortalModule),
  },
];