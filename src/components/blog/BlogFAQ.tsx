interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  faq: FAQItem[];
}

/**
 * Renderiza seção de Perguntas Frequentes ao final do post.
 * O JSON-LD FAQPage é emitido separadamente no BlogPost.tsx via <Helmet>.
 */
export const BlogFAQ = ({ faq }: Props) => {
  const items = (faq || []).filter((f) => f?.q?.trim() && f?.a?.trim());
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Perguntas frequentes"
      className="mt-14 pt-10 border-t-2 border-border"
    >
      <h2 className="font-display text-2xl md:text-3xl font-black uppercase mb-6">
        Perguntas frequentes
      </h2>
      <div className="space-y-5">
        {items.map((item, i) => (
          <details
            key={i}
            className="group border-2 border-border bg-card open:bg-muted/40 transition-colors"
          >
            <summary className="cursor-pointer list-none p-4 font-bold text-base md:text-lg flex items-start justify-between gap-4">
              <span className="flex-1">{item.q}</span>
              <span
                aria-hidden
                className="text-primary text-xl leading-none group-open:rotate-45 transition-transform"
              >
                +
              </span>
            </summary>
            <div className="px-4 pb-4 text-foreground/85 leading-relaxed whitespace-pre-line">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};

export type { FAQItem };
