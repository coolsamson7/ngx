// apps/my-shell/src/bootstrap.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { ShellComponent } from './app/shell.component';
import { ShellModule } from './app/shell.module';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(ShellComponent, {
  providers: [
    importProvidersFrom(ShellModule)
  ]
}).catch((err) => console.error(err));