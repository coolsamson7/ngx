import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FeatureData } from '@ngx/portal';

@Component({
    selector:        'feature-node',
    standalone:      true,
    imports:         [CommonModule],
    templateUrl:     './feature-node.component.html',
    styleUrls:       ['./feature-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureNodeComponent {
    @Input() feature!: FeatureData;
    @Input() depth    = 0;
    @Input() selected: FeatureData | null = null;
    @Input() onSelect!: (f: FeatureData) => void;

    open = true;

    get hasChildren(): boolean  { return !!this.feature.children?.length; }
    get isSelected():  boolean  { return this.selected?.id === this.feature.id; }
    get visibilities(): string[] { return this.feature.visibility ?? []; }

    toggle(event?: Event): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.onSelect) this.onSelect(this.feature);
        if (this.hasChildren) this.open = !this.open;
    }

    onKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Enter':
            case ' ':
                this.toggle(event);
                break;
            case 'ArrowRight':
                if (this.hasChildren) {
                    event.preventDefault();
                    this.open = true;
                }
                break;
            case 'ArrowLeft':
                if (this.hasChildren) {
                    event.preventDefault();
                    this.open = false;
                }
                break;
        }
    }

    trackById(_: number, f: FeatureData): string { return f.id; }
}