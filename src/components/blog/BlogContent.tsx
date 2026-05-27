import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Fragment, useMemo } from 'react';
import { BlogInlineCTA, InlineCTAType } from './BlogInlineCTA';
import { splitMarkdownBlocks, pickCtaPositions } from '@/lib/blog-utils';

interface Props {
  content: string;
  slug: string;
}

const CTA_SEQUENCE: InlineCTAType[] = ['maturidade', 'palestra', 'livro'];

const mdComponents = {
  h1: ({ node, ...p }: any) => <h2 className="text-3xl md:text-4xl font-black uppercase mt-12 mb-4" {...p} />,
  h2: ({ node, ...p }: any) => <h2 className="text-2xl md:text-3xl font-black uppercase mt-10 mb-4" {...p} />,
  h3: ({ node, ...p }: any) => <h3 className="text-xl md:text-2xl font-bold uppercase mt-8 mb-3" {...p} />,
  h4: ({ node, ...p }: any) => <h4 className="text-lg font-bold mt-6 mb-2" {...p} />,
  p: ({ node, ...p }: any) => <p className="text-base md:text-lg leading-relaxed mb-5 text-foreground/90" {...p} />,
  ul: ({ node, ...p }: any) => <ul className="list-disc pl-6 mb-5 space-y-2 text-foreground/90" {...p} />,
  ol: ({ node, ...p }: any) => <ol className="list-decimal pl-6 mb-5 space-y-2 text-foreground/90" {...p} />,
  li: ({ node, ...p }: any) => <li className="leading-relaxed" {...p} />,
  blockquote: ({ node, ...p }: any) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-foreground/80" {...p} />
  ),
  a: ({ node, ...p }: any) => (
    <a className="text-primary font-bold underline underline-offset-4 hover:opacity-80" target="_blank" rel="noopener noreferrer" {...p} />
  ),
  code: ({ node, inline, ...p }: any) =>
    inline ? (
      <code className="px-1.5 py-0.5 bg-muted text-foreground text-sm font-mono rounded-sm" {...p} />
    ) : (
      <code className="block p-4 bg-muted text-foreground text-sm font-mono rounded-sm overflow-x-auto my-5" {...p} />
    ),
  img: ({ node, ...p }: any) => (
    <img className="w-full my-6 border-2 border-foreground" loading="lazy" {...p} />
  ),
  hr: () => <hr className="my-10 border-t-2 border-border" />,
  table: ({ node, ...p }: any) => (
    <div className="overflow-x-auto my-6"><table className="min-w-full border-2 border-foreground" {...p} /></div>
  ),
  th: ({ node, ...p }: any) => <th className="border border-foreground p-2 bg-muted font-bold uppercase text-sm" {...p} />,
  td: ({ node, ...p }: any) => <td className="border border-foreground p-2" {...p} />,
};

export const BlogContent = ({ content, slug }: Props) => {
  const { segments, ctaPositions } = useMemo(() => {
    const blocks = splitMarkdownBlocks(content);
    const positions = pickCtaPositions(blocks.length, CTA_SEQUENCE.length);
    // Build text segments split at CTA positions
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
            <BlogInlineCTA type={CTA_SEQUENCE[i % CTA_SEQUENCE.length]} slug={slug} />
          )}
        </Fragment>
      ))}
      <BlogInlineCTA type="newsletter" slug={slug} />
    </div>
  );
};
