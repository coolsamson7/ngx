import {
    Component,
    Input,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureData } from '@ngx/portal';

@Component({
    selector:        'feature-detail-panel',
    standalone:      true,
    imports:         [CommonModule],
    templateUrl:     './feature-detail.component.html',
    styleUrls:       ['./feature-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureDetailPanelComponent {
    @Input() feature: FeatureData | null = null;
}