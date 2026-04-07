import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FeatureData } from '@ngx/portal';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector:        'feature-detail-panel',
    standalone:      true,
    imports:         [CommonModule, MatDividerModule, MatIconModule],
    templateUrl:     './feature-detail.component.html',
    styleUrls:       ['./feature-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureDetailPanelComponent {
    @Input() feature: FeatureData | null = null;
}