import { NxWelcomeComponent } from './nx-welcome.component';
import { Route } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf'; // The Nx MF utility

export const appRoutes: Route[] = [
  {
    path: '',
    component: NxWelcomeComponent,
  },
  {
      path: 'microfrontend',
      loadChildren: () =>
        loadRemoteModule('microfrontend', './Module').then(
          (m) => m.RemoteEntryModule // This matches the "exposed" name in your Remote
        ),
    },
];
