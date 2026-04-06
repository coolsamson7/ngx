import { Component } from '@angular/core';
import { Feature } from '@ngx/portal';
import { MarkdownToHtmlPipe } from '../markdown.pipe';

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
        docs:      'sample-showcase.md',
        assets: [
          {
            type:    'ts',
            label:   'Source',
            path: 'sample-showcase.ts',
          },
          {
            type:  'html',
            label: 'HTMP',
            url:   'sample-showcase.html',
          },
        ]
      }
})
@Component({
    selector:        'showcase-page',
    standalone:      true,
    imports:         [],//MarkdownToHtmlPipe TODO
    templateUrl:     './sample-showcase.component.html',
    styleUrls:       ['./sample-showcase.component.scss'],
})
export class SampleShowcaseComponent {
}
