import { useMemo } from 'react';
import { slugify } from '@/lib/blog-utils';

interface Props {
  content: string;
}

interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Sumário automático gerado a partir dos H2/H3 do markdown.
 * Ajuda LLMs (ChatGPT, Perplexity, Gemini) a entender a estrutura do artigo
 * e melhora a navegação interna.
 */
export const BlogTOC = ({ content }: Props) => {
  const items = useMemo<TOCItem[]>(() => {
    const lines = (content || '').split('\n');
    const result: TOCItem[] = [];
    let inCodeBlock = false;
    const hasLetters = (s: string) => /[\p{L}\p{N}]/u.test(s);
    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      const m2 = /^##\s+(.+)$/.exec(line);
      const m3 = /^###\s+(.+)$/.exec(line);
      if (m2) {
        const text = m2[1].replace(/[*_`\\]/g, '').trim();
        if (text && hasLetters(text)) result.push({ id: slugify(text), text, level: 2 });
      } else if (m3) {
        const text = m3[1].replace(/[*_`\\]/g, '').trim();
        if (text && hasLetters(text)) result.push({ id: slugify(text), text, level: 3 });
      }
    }
    return result;
  }, [content]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Sumário do artigo"
      className="my-8 rounded-xl border border-border bg-muted/40 p-5"
    >
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        Neste artigo
      </h2>
      <ol className="space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li
            key={`${item.id}-${i}`}
            className={item.level === 3 ? 'pl-5' : ''}
          >
            <a
              href={`#${item.id}`}
              className="text-foreground/85 hover:text-primary underline-offset-4 hover:underline transition-colors"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
