import { Component, Injector } from '@angular/core';
import { Command, WithCommands } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';
import { WithDialogs, WithSnackbar } from '@ngx/ui';

@Feature({
  id: 'test-dialog',
})
@Component({
  standalone: true,
  selector: 'test-dialog',
  templateUrl: './test-dialog.html',
  styleUrls: ['./test-dialog.scss']
})
export class TestDialogComponent extends WithCommands(AbstractFeature, {inheritCommands: false}) {
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
    return "world"
  }


  @Command({
    i18n: 'shell:ok',
  })
  ok() {
    return "ok"
  }

  @Command({
    i18n: 'shell:cancel',
  })
  cancel() {
   return undefined
  }
}
