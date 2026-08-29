import { ExternalLink } from 'lucide-react';

interface Product {
  name: string;
  domain: string;
  category: string;
  description: string;
  tags: string[];
  mockup: 'map' | 'dashboard' | 'chat' | 'news';
}

const PRODUCTS: Product[] = [
  {
    name: 'politiza-ia',
    domain: 'politiza-ia',
    category: 'Inteligência territorial',
    description:
      'Plataforma de inteligência para campanhas e mobilização política: mapas georreferenciados por município, gestão de equipe de campo em tempo real, diagnóstico de ativos e liderança com apoio de IA.',
    tags: ['IA territorial', 'Full-stack', 'Multi-módulo'],
    mockup: 'map',
  },
  {
    name: 'juntosparana399',
    domain: 'juntosparana',
    category: 'Análise de dados e propostas',
    description:
      'Análise de dados eleitorais e cruzamento territorial com IA: importação e leitura de bases públicas, biblioteca de documentos com agentes vinculados, chat de análise para leitura de propostas e cenários.',
    tags: ['Agentes de IA', 'Dados eleitorais', 'Dashboards'],
    mockup: 'dashboard',
  },
  {
    name: 'connect-chat',
    domain: 'connect-chat',
    category: 'Relações públicas e mensageria',
    description:
      'CRM de imprensa e mensageria com geração de conteúdo assistida por IA: campanhas por WhatsApp e e-mail, relacionamento com jornalistas, releases e automação de disparo segmentado.',
    tags: ['Conteúdo com IA', 'Automação', 'CRM de imprensa'],
    mockup: 'chat',
  },
  {
    name: 'vozesparanaenses',
    domain: 'vozesparanaenses.com.br',
    category: 'Portal de notícias',
    description:
      'Portal de notícias regionais com redação assistida por IA, indexação instantânea em buscadores (IndexNow) e segmentação geográfica por município — publicação e SEO no mesmo fluxo.',
    tags: ['Redação com IA', 'SEO/GEO', 'Editorial'],
    mockup: 'news',
  },
];

function Mockup({ type }: { type: Product['mockup'] }) {
  if (type === 'map') {
    return (
      <div className="flex h-full">
        <div className="w-12 shrink-0 border-r border-white/10 bg-black/20 flex flex-col items-center gap-2 py-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 w-6 rounded-full bg-white/15" />
          ))}
        </div>
        <div className="flex-1 p-3 grid grid-cols-6 grid-rows-4 gap-[3px]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{ background: `hsl(30 70% ${38 + ((i * 7) % 30)}% / ${0.25 + ((i * 13) % 40) / 100})` }}
            />
          ))}
        </div>
        <div className="w-20 shrink-0 border-l border-white/10 bg-black/20 p-2 space-y-2">
          <div className="h-8 rounded bg-white/10" />
          <div className="h-8 rounded bg-white/10" />
        </div>
      </div>
    );
  }
  if (type === 'dashboard') {
    return (
      <div className="p-3 h-full flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded bg-white/10 p-2 space-y-1">
              <div className="h-1.5 w-8 rounded bg-white/25" />
              <div className="h-3 w-10 rounded bg-primary/60" />
            </div>
          ))}
        </div>
        <div className="flex-1 rounded bg-black/20 flex items-end gap-1.5 p-3">
          {[40, 65, 30, 80, 55, 90, 45, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-primary/50" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === 'chat') {
    return (
      <div className="flex h-full">
        <div className="w-16 shrink-0 border-r border-white/10 bg-black/20 p-2 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-6 rounded bg-white/15" />
          ))}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-end gap-2">
          <div className="h-5 w-2/3 rounded-lg rounded-bl-none bg-white/20" />
          <div className="h-5 w-3/5 rounded-lg rounded-bl-none bg-white/20" />
          <div className="h-5 w-1/2 self-end rounded-lg rounded-br-none bg-primary/70" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-3 h-full grid grid-cols-3 grid-rows-2 gap-2">
      <div className="col-span-2 row-span-2 rounded bg-white/10 p-2 flex flex-col justify-end gap-1">
        <div className="h-1.5 w-1/3 rounded bg-primary/60" />
        <div className="h-2.5 w-4/5 rounded bg-white/25" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rounded bg-white/10 p-2 flex flex-col justify-end gap-1">
          <div className="h-1.5 w-1/2 rounded bg-white/20" />
        </div>
      ))}
    </div>
  );
}

function BrowserFrame({ domain, mockup }: { domain: string; mockup: Product['mockup'] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-md bg-[#12201E]">
      <div className="flex items-center gap-2 px-3 py-2 bg-black/25 border-b border-white/10">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span
          className="ml-2 truncate rounded px-2 py-0.5 text-[10px] text-white/50 bg-white/5"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {domain}
        </span>
      </div>
      <div className="h-40">
        <Mockup type={mockup} />
      </div>
    </div>
  );
}

const ProductsSection = () => {
  return (
    <section id="produtos" className="relative overflow-hidden bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-14 space-y-4">
          <div className="section-kicker">Prova de conceito</div>
          <h2 className="display-title text-4xl sm:text-5xl">
            Ideias que viraram <span className="highlight-yellow">produtos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Antes de falar sobre orquestração de fluxos com IA no palco, eu construo. Estas são algumas das
            soluções reais que projetei e coloquei no ar — não protótipos de apresentação.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <BrowserFrame domain={p.domain} mockup={p.mockup} />
              <div className="space-y-2">
                <div
                  className="text-xs font-semibold uppercase tracking-wider text-primary"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {p.category}
                </div>
                <h3 className="text-xl text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto flex items-center justify-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          Telas ilustrativas — algumas das soluções que já desenvolvi, entre outras não listadas aqui.
        </p>
      </div>
    </section>
  );
};

export default ProductsSection;
