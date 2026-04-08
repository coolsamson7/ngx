import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { marked } from 'marked';
import Prism from 'prismjs';

import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

@Component({
    selector: 'prism-highlight',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div
            #container
            [class.is-markdown]="isMarkdown"
            [class.is-code]="!isMarkdown">
            <pre *ngIf="!isMarkdown" class="code-pre"><code #codeElement></code></pre>
            <div *ngIf="isMarkdown" #markdownElement class="md-content"></div>
        </div>
    `,
    styleUrls: ['./prism-highlight.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class PrismHighlightComponent implements OnChanges {
    @Input() code = '';
    @Input() language = 'typescript';

    @ViewChild('codeElement') codeElement!: ElementRef<HTMLElement>;
    @ViewChild('markdownElement') markdownElement!: ElementRef<HTMLElement>;

    get isMarkdown(): boolean {
        return this.language === 'markdown' || this.language === 'md';
    }

    ngOnChanges(): void {
        queueMicrotask(() => this.highlight()); // ✅ cleaner than setTimeout
    }

    private highlight(): void {
        const source = this.code?.trim() ?? '';
        if (!source) return;

        if (this.isMarkdown) {
            if (!this.markdownElement) return;
            this.markdownElement.nativeElement.innerHTML = marked.parse(source) as string;
            Prism.highlightAllUnder(this.markdownElement.nativeElement);
        } else {
            if (!this.codeElement) return;
            const el = this.codeElement.nativeElement;
            el.textContent = source;
            el.className = `language-${this.language}`;
            Prism.highlightElement(el);
        }
    }
}