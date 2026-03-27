import { Component } from '@angular/core';
import { AbstractFeature, Feature } from '@ngx/portal';

@Feature({
  id: '',
  label: 'my-microfrontend',
  tags: ['navigation'],
  visibility: ['public', 'private'],
})
@Component({
  selector: 'my-microfrontend',
  template: `<div>my-microfrontend</div>`,
  standalone: true
})
export class RemoteEntryComponent extends AbstractFeature {}
