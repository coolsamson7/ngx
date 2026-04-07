import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
    AfterViewInit,
} from '@angular/core';

import { marked } from 'marked';
import Prism from 'prismjs';

// Language Imports
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

@Directive({
    selector: '[prismHighlight]',
    standalone: true,
})
export class PrismHighlightDirective implements OnChanges, AfterViewInit {

    @Input() prismHighlight = '';
    @Input() language       = 'typescript';

    private initialized = false;

    constructor(private el: ElementRef<HTMLElement>) {}

    ngAfterViewInit(): void {
        this.initialized = true;
        this.highlight();
    }

    ngOnChanges(): void {
        if (this.initialized) this.highlight();
    }

    private highlight(): void {
        const el   = this.el.nativeElement;
        const code = this.prismHighlight?.trim() ?? ''; // Fixes the first-line indent

        if (!el || !code) return;

        if (this.language === 'markdown' || this.language === 'md') {
            // 1. Transform Markdown string to HTML (Headers, Lists, etc.)
            const html = marked.parse(code) as string;
            el.innerHTML = html;

            // 2. Highlight any embedded code blocks (```ts, etc.)
            Prism.highlightAllUnder(el);
        } else {
            // 3. Standard Code Mode (TS, JSON, etc.)
            el.textContent = code;
            el.className   = `language-${this.language}`;
            Prism.highlightElement(el);
        }
    }
}