import { Component, input, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconRegistry } from './icon-registry';

@Component({
  selector: 'svg-icon',
  standalone: true,
  template: `
    <span class="icon-container"
          [innerHTML]="svg()"
          [style.width.px]="size()"
          [style.height.px]="size()">
    </span>
  `,
  styles: [`
    :host {
      display: inline-block; /* Ensures the host component itself has a size */
      vertical-align: middle;
    }

    .icon-container {
      display: flex; /* Flex handles dimensions better than standard inline */
      align-items: center;
      justify-content: center;

      ::ng-deep svg {
        display: block;
        width: 100%;
        height: 100%;
        /* fill: currentColor; -> This only works if your SVG paths have fill="currentColor" or no fill at all */
      }
    }
  `]
})
export class IconComponent {
    name = input.required<string>();
    size = input<number>(24);

    private registry = inject(IconRegistry);
    private sanitizer = inject(DomSanitizer);

    svg = computed<SafeHtml>(() =>
      this.sanitizer.bypassSecurityTrustHtml(this.registry.get(this.name()))
    );
  }