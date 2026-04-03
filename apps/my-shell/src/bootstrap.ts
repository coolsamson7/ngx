import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ShellModule } from './app/shell.module';
import { ShellComponent } from './app/shell.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(ShellComponent, {
  providers: [
    importProvidersFrom(ShellModule)
  ]
})
  .catch(err => console.error(err));