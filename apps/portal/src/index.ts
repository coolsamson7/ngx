import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portal',
  template: `<h2>Portal Module</h2>`
})
export class PortalComponent {}

const routes: Routes = [{ path: '', component: PortalComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [PortalComponent]
})
export class PortalModule {}