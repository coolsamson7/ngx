import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { FeatureData } from '@ngx/portal';

@Component({
    selector:        'feature-node',
    standalone:      true,
    imports:         [CommonModule, MatIconModule],
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

    get hasChildren(): boolean { return !!this.feature.children?.length; }
    get isSelected():  boolean { return this.selected?.id === this.feature.id; }

    get vis() {
        const v = this.feature.visibility || ['public'];
        if (v.includes('private')) return { label: 'private', class: 'badge-private' };
        return { label: 'public', class: 'badge-public' };
    }

    toggle(): void {
        if (this.onSelect) this.onSelect(this.feature);
        if (this.hasChildren) this.open = !this.open;
    }

    trackById(_: number, f: FeatureData): string { return f.id; }
}