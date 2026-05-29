import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Fragment, useMemo } from 'react';
import { BlogInlineCTA, InlineCTAType } from './BlogInlineCTA';
import { splitMarkdownBlocks, pickCtaPositions, slugify } from '@/lib/blog-utils';

// Extrai texto puro de filhos do React/markdown para gerar IDs estáveis em H2/H3
const extractText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node.props?.children) return extractText(node.props.children);
  return '';
};

const hasLetters = (s: string) => /[\p{L}\p{N}]/u.test(s);

const headingId = (children: any): string => {
  const text = (extractText(children) || '').replace(/\\/g, '').trim();
  return text ? slugify(text) : '';
};


interface Props {
  content: string;
  slug: string;
}

const CTA_SEQUENCE: InlineCTAType[] = ['maturidade', 'palestra', 'livro'];

// Extracts text from a markdown AST node tree
const nodeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (node.props?.children) return nodeText(node.props.children);
  return '';
};

const mdComponents = {
  h1: ({ node, children, ...p }: any) => {
    if (!hasLetters(extractText(children))) return null;
    return <h2 id={headingId(children)} className="font-display text-3xl md:text-4xl font-black uppercase mt-16 mb-5 pb-2 border-b border-border scroll-mt-24" {...p}>{children}</h2>;
  },
  h2: ({ node, children, ...p }: any) => {
    if (!hasLetters(extractText(children))) return null;
    return <h2 id={headingId(children)} className="font-display text-2xl md:text-[1.75rem] font-black uppercase mt-14 mb-4 pb-2 border-b border-border scroll-mt-24" {...p}>{children}</h2>;
  },
  h3: ({ node, children, ...p }: any) => {
    if (!hasLetters(extractText(children))) return null;
    return <h3 id={headingId(children)} className="font-display text-xl md:text-2xl font-bold uppercase mt-10 mb-3 scroll-mt-24" {...p}>{children}</h3>;
  },
  h4: ({ node, ...p }: any) => <h4 className="font-display text-lg font-bold mt-8 mb-2" {...p} />,
  p: ({ node, ...p }: any) => <p className="blog-p" {...p} />,
  ul: ({ node, ...p }: any) => <ul className="blog-ul" {...p} />,
  ol: ({ node, ...p }: any) => <ol className="blog-ol" {...p} />,
  li: ({ node, ...p }: any) => <li className="leading-relaxed mb-2" {...p} />,
  blockquote: ({ node, children, ...p }: any) => {
    const text = nodeText(children).trim();
    if (text.startsWith('[!destaque]')) {
      const clean = text.replace(/^\[!destaque\]\s*/, '');
      return (
        <aside className="pull-quote" {...p}>
          <span className="pull-quote-mark" aria-hidden>“</span>
          <p>{clean}</p>
        </aside>
      );
    }
    return <blockquote className="blog-quote" {...p}>{children}</blockquote>;
  },
  a: ({ node, ...p }: any) => (
    <a className="text-primary underline underline-offset-[3px] decoration-[1.5px] hover:opacity-80" target="_blank" rel="noopener noreferrer" {...p} />
  ),
  code: ({ node, inline, ...p }: any) =>
    inline ? (
      <code className="px-1.5 py-0.5 bg-muted text-foreground text-[0.9em] font-mono rounded-sm" {...p} />
    ) : (
      <code className="block p-4 bg-muted text-foreground text-sm font-mono rounded-sm overflow-x-auto my-6" {...p} />
    ),
  img: ({ node, alt, ...p }: any) => (
    <figure className="my-8 -mx-4 md:mx-0">
      <img className="w-full border border-border" loading="lazy" alt={alt} {...p} />
      {alt && <figcaption className="text-xs text-muted-foreground mt-2 text-center italic">{alt}</figcaption>}
    </figure>
  ),
  hr: () => <hr className="my-12 border-t border-border w-24 mx-auto" />,
  table: ({ node, ...p }: any) => (
    <div className="overflow-x-auto my-8"><table className="min-w-full border border-border text-sm" {...p} /></div>
  ),
  th: ({ node, ...p }: any) => <th className="border border-border p-2 bg-muted font-bold uppercase text-xs" {...p} />,
  td: ({ node, ...p }: any) => <td className="border border-border p-2" {...p} />,
};

export const BlogContent = ({ content, slug }: Props) => {
  const { segments, ctaPositions } = useMemo(() => {
    const blocks = splitMarkdownBlocks(content);
    const positions = pickCtaPositions(blocks.length, CTA_SEQUENCE.length);
    const segs: string[] = [];
    let start = 0;
    for (const pos of positions) {
      segs.push(blocks.slice(start, pos).join('\n\n'));
      start = pos;
    }
    segs.push(blocks.slice(start).join('\n\n'));
    return { segments: segs, ctaPositions: positions };
  }, [content]);

  return (
    <div className="blog-content">
      {segments.map((seg, i) => (
        <Fragment key={i}>
          {seg && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {seg}
            </ReactMarkdown>
          )}
          {i < ctaPositions.length && (
            <div className="my-14">
              <BlogInlineCTA type={CTA_SEQUENCE[i % CTA_SEQUENCE.length]} slug={slug} />
            </div>
          )}
        </Fragment>
      ))}
      <div className="my-14">
        <BlogInlineCTA type="newsletter" slug={slug} />
      </div>
    </div>
  );
};
