import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureData } from '@ngx/portal';
import { PrismHighlightComponent } from '../showcase-browser/prism-highlight.component';

const CYCLIC_KEYS = new Set(['$parent', 'parent', '_parent', '__parent', 'children']);

function safeSerialize(data: FeatureData): string {
    const clean = Object.fromEntries(
        Object.entries(data)
            .filter(([k]) => !CYCLIC_KEYS.has(k) && !k.startsWith('$') && !k.startsWith('_'))
            .map(([k, v]) => {
                if (k === 'children' && Array.isArray(v))
                    return [k, (v as FeatureData[]).map(c => c.id)];
                return [k, v];
            })
    );

    if (data.children?.length)
        clean['children'] = data.children.map(c => c.id);

    return JSON.stringify(clean, null, 2);
}

@Component({
    selector:        'feature-detail-panel',
    standalone:      true,
    imports: [CommonModule, PrismHighlightComponent],
    templateUrl:     './feature-detail.component.html',
    styleUrls:       ['./feature-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureDetailPanelComponent implements OnChanges {
    @Input() feature: FeatureData | null = null;
    serialized = '';

    ngOnChanges(): void {
        this.serialized = this.feature ? safeSerialize(this.feature) : '';
    }
}