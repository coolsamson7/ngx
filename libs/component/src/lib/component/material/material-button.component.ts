import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../components';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-material-button',
  template: `
    <button mat-button (click)="clicked.emit()" [disabled]="disabled" [color]="color">
      {{ label }}
    </button>
  `,
  standalone: true,
  imports: [MatButtonModule]
})
export class MaterialButtonComponent implements Button {
  @Input() appearance: 'icon' | 'text' | 'icon-text' = 'text';
  @Input() color: 'primary' | 'accent' = 'primary';

  @Input() label!: string;
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();
}