import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../components';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-material-button',
  template: `
    <button mat-button (click)="clicked.emit()" [disabled]="disabled">
      {{ label }}
    </button>
  `,
  standalone: true,
  imports: [MatButtonModule]
})
export class MaterialButtonComponent implements Button {
  @Input() label!: string;
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();
}