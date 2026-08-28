import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Mic, BookOpen, Headphones, Mail } from 'lucide-react';
import { useTrackCTA } from '@/hooks/useTrackCTA';

export type InlineCTAType = 'maturidade' | 'palestra' | 'livro' | 'podcast' | 'newsletter';

interface Props {
  type: InlineCTAType;
  slug: string;
}

const CONFIG: Record<InlineCTAType, {
  kicker: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  Icon: any;
  bg: string;
  text: string;
  border: string;
  shadowColor: string;
}> = {
  maturidade: {
    kicker: 'Pause 30 segundos',
    title: 'Descubra seu nível de maturidade em IA',
    description: 'Diagnóstico gratuito em 5 minutos. Receba um relatório personalizado com plano de ação 30/60/90 dias.',
    cta: 'Fazer o teste agora',
    href: '/teste-ia',
    Icon: Brain,
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    border: 'border-primary-foreground/20',
    shadowColor: 'hsl(var(--secondary))',
  },
  palestra: {
    kicker: 'Para empresas',
    title: 'Leve essa conversa para sua equipe',
    description: 'Palestras, workshops e mentorias sob medida. Receba uma proposta personalizada em 24h.',
    cta: 'Solicitar proposta',
    href: '/#contato',
    Icon: Mic,
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    border: 'border-secondary-foreground/20',
    shadowColor: 'hsl(var(--primary))',
  },
  livro: {
    kicker: 'Aprofunde',
    title: 'Leia o livro: Aprenda Inteligência Artificial na Prática',
    description: 'Um guia direto para profissionais que precisam dominar IA agora, não em cinco anos.',
    cta: 'Ver o livro',
    href: '/#book',
    Icon: BookOpen,
    bg: 'bg-accent',
    text: 'text-accent-foreground',
    border: 'border-accent-foreground/20',
    shadowColor: 'hsl(var(--foreground))',
  },
  podcast: {
    kicker: 'Ouça',
    title: 'Podcast Uivo do Lobo',
    description: 'Conversas semanais sobre tecnologia, IA e o futuro do trabalho.',
    cta: 'Ouvir episódios',
    href: '/#podcast',
    Icon: Headphones,
    bg: 'bg-foreground',
    text: 'text-background',
    border: 'border-background/20',
    shadowColor: 'hsl(var(--primary))',
  },
  newsletter: {
    kicker: 'Newsletter',
    title: 'Receba insights de IA toda semana',
    description: 'Artigos, análises e provocações direto no seu LinkedIn.',
    cta: 'Assinar no LinkedIn',
    href: 'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7216140554995175424',
    external: true,
    Icon: Mail,
    bg: 'bg-card',
    text: 'text-foreground',
    border: 'border-border',
    shadowColor: 'hsl(var(--primary))',
  },
};

export const BlogInlineCTA = ({ type, slug }: Props) => {
  const c = CONFIG[type];
  const { trackCTA } = useTrackCTA();
  const Icon = c.Icon;

  const onClick = () => trackCTA(`blog_inline_${type}`, `blog_post:${slug}`);

  const inner = (
    <div
      className={`my-10 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md ${c.bg} ${c.text} transition-all hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 p-3 rounded-full border ${c.border}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {c.kicker}
          </div>
          <h3 className="text-xl md:text-2xl leading-tight mb-2">
            {c.title}
          </h3>
          <p className="text-sm md:text-base opacity-90 mb-4">{c.description}</p>
          <div className={`inline-flex items-center gap-2 font-semibold text-sm border-b ${c.border}`}>
            {c.cta}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );

  if (c.external) {
    return (
      <a href={c.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="block no-underline">
        {inner}
      </a>
    );
  }

  if (c.href.startsWith('/#')) {
    return (
      <a href={c.href} onClick={onClick} className="block no-underline">
        {inner}
      </a>
    );
  }

  return (
    <Link to={c.href} onClick={onClick} className="block no-underline">
      {inner}
    </Link>
  );
};
