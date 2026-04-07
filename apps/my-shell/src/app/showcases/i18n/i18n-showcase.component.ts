import { Component, Injector } from '@angular/core';
import { CommandToolbarComponent, WithCommandToolbar } from '@ngx/component';
import { Command, ViewComponent, WithCommands, WithI18N, WithView } from '@ngx/foundation';
import { TranslatePipe } from '@ngx/i18n';
import { AbstractFeature, Feature } from '@ngx/portal';

@Feature({
  id: "i18n-showcase",
  parent: "showcases",
  description: "i18n showcase",
  tags: ["showcase"],
  permissions: [],
  visibility: ["private", "public"],
  showcase: {
        title:       'i18n',
        description: 'A i18n showcase',
        group:       'Core',
        order:       1,
        docs:      'showcases/i18n/i18n-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'showcases/i18n/i18n-showcase.component.ts',
          },
          {
            type:  'html',
            label: 'HTML',
            path:   'showcases/i18n/i18n-showcase.component.html',
          },
             {
            type:  'scss',
            label: 'SCSS',
            path:   'showcases/i18n/i18n-showcase.component.scss',
          },
        ]
      }
})
@Component({
    selector:        'i18n-showcase-page',
    standalone:      true,
    imports:         [ CommandToolbarComponent, ViewComponent, TranslatePipe ],
    templateUrl:     './i18n-showcase.component.html',
    styleUrls:       ['./i18n-showcase.component.scss'],
})
export class I18NShowcaseComponent extends WithI18N(WithView(WithCommandToolbar(WithCommands(AbstractFeature)))) {
  constructor(injector: Injector) {
    super(injector);
  }

  // override WithCommandToolbar

  override buildToolbar() {
    this.addCommand2Toolbar("open")

    this.translate("shell:hello_world", {world: "world"})
    this.translate("shell:current_price", {today: new Date(), price: 1})
  }

  get today(): Date {
    return new Date();
  }

  // commands

  @Command({
        i18n: 'shell:open',
        icon: "forward",
  })
  open() {
    this.translate('shell:open.label')
  }
}
