import { Component, Injector } from '@angular/core';
import { AbstractFeature, Feature } from '@ngx/portal';

@Feature({
  id: "sample-showcase",
  parent: "showcases",
  description: "showcase",
  tags: ["showcase"],
  permissions: [],
  visibility: ["private", "public"],
  showcase: {
        title:       'Sample',
        description: 'A sample',
        group:       'Core',
        order:       1,
        docs:      'showcases/sample/sample-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'showcases/sample/sample-showcase.component.ts',
          },
          {
            type:  'html',
            label: 'HTML',
            path:   'showcases/sample/sample-showcase.component.html',
          },
             {
            type:  'scss',
            label: 'SCSS',
            path:   'showcases/sample/sample-showcase.component.scss',
          },
        ]
      }
})
@Component({
    selector:        'showcase-page',
    standalone:      true,
    imports:         [],
    templateUrl:     './sample-showcase.component.html',
    styleUrls:       ['./sample-showcase.component.scss'],
})
export class SampleShowcaseComponent extends AbstractFeature {
  constructor(injector: Injector) {
    super(injector);
  }
}
