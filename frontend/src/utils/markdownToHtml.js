// utils/markdownToHtml.js
// Lightweight Markdown → HTML converter for Moodle XML export.
// Handles the most common formatting used in quiz questions.

export function markdownToHtml(text) {
    if (!text) return '';

    let html = text;

    // Escape basic HTML entities first (but we'll wrap in CDATA, so this is mainly for safety)
    // Actually, since we output into CDATA, we should NOT escape — we want real HTML.

    // Code blocks (``` ... ```)  — must be processed before inline rules
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `<pre><code>${escaped}</code></pre>`;
    });

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers (must come before bold since ## uses no special chars)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold + Italic (***text*** or ___text___)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

    // Strikethrough (~~text~~)
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Blockquotes (> text)
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    // Unordered lists (- item or * item)
    html = html.replace(/^(?:[-*]) (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> that aren't already in <ul> into <ol>
    html = html.replace(/(?<!<\/ul>)((?:<li>.*<\/li>\n?)+)/g, (match) => {
        // Only wrap if not already wrapped
        if (match.includes('<ul>') || match.includes('<ol>')) return match;
        return `<ol>${match}</ol>`;
    });

    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr>');

    // Line breaks: convert double newlines to <p> boundaries, single newlines to <br>
    // First, split by double newline to get paragraphs
    const blocks = html.split(/\n\n+/);
    html = blocks
        .map(block => {
            const trimmed = block.trim();
            // Don't wrap block elements in <p>
            if (
                trimmed.startsWith('<h') ||
                trimmed.startsWith('<ul') ||
                trimmed.startsWith('<ol') ||
                trimmed.startsWith('<pre') ||
                trimmed.startsWith('<blockquote') ||
                trimmed.startsWith('<hr') ||
                trimmed === ''
            ) {
                return trimmed;
            }
            // Convert remaining single newlines to <br>
            return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
        })
        .join('\n');

    return html;
}
