import { Component, Injector } from '@angular/core';
import { Command, WithCommands } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';
import { WithSnackbar } from '@ngx/ui';

@Feature({
  id: 'home',
  isDefault: true,
})
@Component({
  standalone: true,
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslatePipe],
})
export class HomeComponent extends WithSnackbar(WithCommands(AbstractFeature, {inheritCommands: false})) {
  // constructor

  constructor(injector: Injector) {
    super(injector);
  }

  // commands

  @Command({
    i18n: 'shell:hello',
  })
  hello() {
    console.log("hello")

    this.showSnackbar("Hello world!", { duration: 2000 })
  }
}
