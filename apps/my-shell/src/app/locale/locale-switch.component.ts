import { Component, inject, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, NgFor } from '@angular/common';
import { LocaleManager } from '@ngx/i18n';

@Component({
    selector: 'locale-switch',
    template: `
        <mat-select
            [value]="localeManager.getLocale().baseName"
            (selectionChange)="setLocale($event.value)"
            class="locale-select">
            <mat-option *ngFor="let locale of localeManager.supportedLocales" [value]="locale">
                {{ displayName(locale) }}
            </mat-option>
        </mat-select>
    `,
    styles: [`
        :host {
            display: inline-flex;
            align-items: center;
        }

        .locale-select {
            font-size: 13px;
            width: auto;
            min-width: 80px;

            /* pull the arrow closer and align with toolbar buttons */
            ::ng-deep .mat-mdc-select-trigger {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                height: 36px;
                padding: 0 4px;
            }

            ::ng-deep .mat-mdc-select-value {
                width: auto;
                white-space: nowrap;
            }

            ::ng-deep .mat-mdc-select-arrow-wrapper {
                padding-left: 2px;
            }
        }
    `],
    standalone: true,
    imports: [MatSelectModule, CommonModule, NgFor]
})
export class LocaleSwitchComponent implements OnInit {
    // instance data

    localeManager = inject(LocaleManager);

    // protected

    protected setLocale(locale: string) {
        this.localeManager.setLocale(locale);
    }

    protected displayName(locale: string): string {
        return locale
    }

    // implement OnInit
    
    ngOnInit(): void {
        console.log()
    }
}