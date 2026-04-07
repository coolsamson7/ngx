import {
    Component,
    inject,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AbstractFeature, Feature, FeatureRegistry } from '@ngx/portal';
import type { FeatureData, ShowcaseAsset } from '@ngx/portal';
import { PrismHighlightDirective } from './prism-highlight.directive';

export type ActiveTab = 'preview' | 'docs' | number;
export type ViewMode  = 'preview' | 'split' | 'code';

@Feature({
    id:         'showcases',
    label:      'Showcases',
    tags:       ['navigation'],
    visibility: ['public', 'private']
})
@Component({
    selector:        'showcase-page',
    standalone:      true,
    imports:         [CommonModule, RouterModule, RouterOutlet, PrismHighlightDirective],
    templateUrl:     './showcase-browser.component.html',
    styleUrls:       ['./showcase-browser.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent extends AbstractFeature implements OnInit, OnDestroy {

    private featureRegistry = inject(FeatureRegistry);
    private router          = inject(Router);
    private cdr             = inject(ChangeDetectorRef);

    private routerSub?: Subscription;

    // ── state ──
    view:      ViewMode  = 'split';
    activeTab: ActiveTab = 'preview';
    copiedIndex: number | null = null;

    selectedId?:          string;
    selectedShowcase?:    FeatureData;
    selectedLabel =       '';
    selectedDescription?: string;

    assets:   ShowcaseAsset[] = [];
    docs?:    string;
    hasDocs = false;

    // ── constructor ──

    constructor(injector: Injector) {
        super(injector);

         this.showcases.forEach(s => this.normalizeShowcase(s));
    }

    // ── computed from state ──

    get showcases(): any[] {
        return this.featureRegistry.finder().withTag('showcase').find();
    }

    get activeAssetIndex(): number | null {
        if (typeof this.activeTab === 'number') return this.activeTab;
        return this.assets.length > 0 ? 0 : null;
    }

    get activeAsset(): ShowcaseAsset | null {
        return this.activeAssetIndex !== null ? this.assets[this.activeAssetIndex] : null;
    }

    get showPreview(): boolean {
        return (this.activeTab === 'preview' || typeof this.activeTab === 'number')
            && (this.view === 'split' || this.view === 'preview');
    }

    get showCode(): boolean {
        return !!this.activeAsset
            && this.activeTab !== 'docs'
            && (this.view === 'split' || this.view === 'code');
    }

    get showDocs(): boolean {
        return this.activeTab === 'docs' && this.hasDocs;
    }

    get bodyClass(): string {
        return this.view === 'code' && !this.showDocs ? 'sc-body code-only' : 'sc-body';
    }

    get noSource(): boolean {
        return !this.showDocs && (this.view === 'split' || this.view === 'code') && !this.activeAsset;
    }

    // ── lifecycle ──

    override ngOnInit(): void {
        super.ngOnInit();

        this.updateSelected(this.router.url);

        this.routerSub = this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((event: any) => {
                this.activeTab = 'preview';
                this.updateSelected(event.urlAfterRedirects || event.url);
                this.cdr.markForCheck();
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routerSub?.unsubscribe();
    }

    // ── private ──

    private normalizeShowcase(showcase: FeatureData): void {
        if (!showcase.showcase) return;

        const sc = showcase.showcase;

        sc.assets ??= [];

        if (sc.docs) {
            const alreadyExists = sc.assets.some(
                (a: any) => a.type === 'md' && (a.path === sc.docs || a.url === sc.docs)
            );

            if (!alreadyExists) {
                sc.assets.unshift({
                    type:  'md',
                    label: 'Docs',
                    path:   sc.docs,   // treat like any other asset
                });
            }

            delete sc.docs;
        }
    }

    private updateSelected(url: string): void {
        this.selectedId       = url.slice(1).replace('/', '.');
        this.selectedShowcase = this.showcases.find(s => s.path === this.selectedId);

        if (!this.selectedShowcase) {
            this.assets = [];
            this.docs   = undefined;
            this.hasDocs = false;
            return;
        }

        this.selectedLabel       = this.selectedShowcase.showcase?.title
            || this.selectedShowcase.label
            || this.selectedShowcase.id
            || '';
        this.selectedDescription = this.selectedShowcase.showcase?.description;
        this.assets              = this.selectedShowcase.showcase?.assets ?? [];

        this.loadMissingAssets();

        this.docs                = this.selectedShowcase.showcase?.assets?.find((a: any) => a.type === 'md')?.content;
        this.hasDocs             = !!this.docs;
    }

    private loadMissingAssets(): void {
        this.assets.forEach(asset => {
            if (asset.path && !asset.content) {
                fetch(`/assets/${asset.path}`)
                    .then(r => r.ok ? r.text() : Promise.reject())
                    .then(text => {
                        asset.content = text;
                        this.cdr.markForCheck();
                    })
                    .catch(() => {
                        asset.content = `// failed to load assets/${asset.path}`;
                        this.cdr.markForCheck();
                    });
            }
        });
    }

    // ── template helpers ──

    getAssetContent(asset: ShowcaseAsset): string {
        return asset.content ?? 'Loading…';
    }

    mapLang(type: string): string {
        const map: Record<string, string> = {
            ts:   'typescript',
            html: 'markup',
            scss: 'scss',
            md:   'markdown',
            json: 'json',
        };
        return map[type] ?? type;
    }

    navigate(path: string): void {
        this.router.navigate(path.split('.'));
    }

    setView(view: ViewMode): void {
        this.view = view;
        this.cdr.markForCheck();
    }

    setActiveTab(tab: ActiveTab): void {
        this.activeTab = tab;
        this.cdr.markForCheck();
    }

    isTabActive(tab: ActiveTab): boolean {
        return this.activeTab === tab;
    }

    copyContent(content: string, index: number): void {
        navigator.clipboard.writeText(content).then(() => {
            this.copiedIndex = index;
            this.cdr.markForCheck();
            setTimeout(() => {
                this.copiedIndex = null;
                this.cdr.markForCheck();
            }, 2000);
        });
    }

    trackByIndex(i: number): number { return i; }
    trackById(_: number, s: any): string { return s.id; }
}