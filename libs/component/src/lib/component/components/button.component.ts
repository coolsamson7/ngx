import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DelegatingComponent } from '../delegating-component';


export interface Button {
  label: string;
  disabled: boolean;
  clicked: EventEmitter<void>;
}

@Component({
  selector: 'ngx-button',
  template: `<ng-container #vc></ng-container>`,
  standalone: true
})
export class ButtonComponent extends DelegatingComponent<Button> {

  @Input() label!: string;
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();

  protected key(): string {
    return 'button';
  }

  protected fallback() {
    return DefaultButtonComponent;
  }
}

@Component({
  selector: 'default-button',
  template: `
    <button (click)="clicked.emit()" [disabled]="disabled">
      {{ label }}
    </button>
  `
})
export class DefaultButtonComponent implements Button {
  @Input() label!: string;
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();
}
