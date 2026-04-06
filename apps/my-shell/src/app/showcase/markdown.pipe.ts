import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';

// ---------------------------------------------------------------------------
// MarkdownToHtml pipe — port of the React MarkdownPane useMemo
// ---------------------------------------------------------------------------

@Pipe({ name: 'markdownToHtml', standalone: true, pure: true })
export class MarkdownToHtmlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);

    transform(content: string | undefined): SafeHtml {
        if (!content) return '';

        const html = content
            .replace(/^### (.+)$/gm,   '<h3>$1</h3>')
            .replace(/^## (.+)$/gm,    '<h2>$1</h2>')
            .replace(/^# (.+)$/gm,     '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g,     '<code>$1</code>')
            .replace(/^- (.+)$/gm,     '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
            .replace(/\n\n/g,          '</p><p>')
            .replace(/^(?!<[hul])/,    '<p>')
            .replace(/(?<![>])$/,      '</p>');

        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}