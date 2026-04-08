import { Component, Injector } from '@angular/core';
import { ViewComponent, WithView } from '@ngx/foundation';
import { AbstractFeature, Feature } from '@ngx/portal';
import { SampleExtensionPoint } from '../extension/sample.extension';
import { ButtonComponent } from '@ngx/component';

@Feature({
  id: 'home',
  label: 'Home',
  tags: ['navigation'],
  visibility: ['public', 'private'],
  isDefault: true,
})
@Component({
  standalone: true,
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [ButtonComponent],
})
export class HomeComponent extends AbstractFeature {
  extensionPoint! : SampleExtensionPoint
 
  // constructor

  constructor(injector: Injector) {
    super(injector);

    //this.addExtensionPoint(this.extensionPoint = new SampleExtensionPoint()).addMenu("home")

    //this.extend()
  }

}
