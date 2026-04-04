import { Component, input, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconRegistry } from './icon-registry';

@Component({
  selector: 'svg-icon',
  standalone: true,
  template: `<span class="icon" [innerHTML]="svg()" [style.width.px]="size()" [style.height.px]="size()"></span>`,
  styles: [`
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      ::ng-deep svg {
        width: 100%;
        height: 100%;
        fill: currentColor;  /* inherits text color automatically */
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