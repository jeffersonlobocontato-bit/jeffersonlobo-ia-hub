import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO, SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { Copy, Check } from 'lucide-react';
import jeffersonPortrait from '@/assets/jefferson-portrait.png';
import capaAsset from '@/assets/livro-del-capa-flutuante.png.asset.json';

const capaFlutuante = capaAsset.url;

const EBOOK_URL = 'https://pay.hotmart.com/O101044688E?hotfeature=51';
const IMPRESSO_URL = 'https://pay.hotmart.com/U101121849J?bid=1788185288843&hotfeature=51';

const BENEFICIOS = [
  {
    n: '01',
    title: 'Fidelidade autoral',
    desc: 'Estruture agentes que reproduzem o estilo e o vocabulário do autor original, evitando os textos genéricos das IAs comuns.',
  },
  {
    n: '02',
    title: 'Sem alucinações',
    desc: 'Uma abordagem linguística que reduz drasticamente o risco de alucinações, preservando a coerência lógica dos textos.',
  },
  {
    n: '03',
    title: 'Método inédito',
    desc: 'Você não precisa programar. O DEL guia passo a passo usando apenas o ChatGPT Plus e técnicas de decomposição linguística.',
  },
  {
    n: '04',
    title: 'Fundamentação',
    desc: 'Diferente dos cursos que só ensinam prompts, o livro une linguística, gramática e semântica pra formar um agente funcional.',
  },
  {
    n: '05',
    title: 'Aplicabilidade',
    desc: 'Pra proteger sua marca, automatizar atendimentos ou gerar conteúdo com padrão editorial — o método se adapta.',
  },
  {
    n: '06',
    title: 'Escalabilidade',
    desc: 'Crie agentes escaláveis pra produção de conteúdo, mantendo voz própria mesmo com alto volume de entregas.',
  },
];

const FAQS = [
  {
    q: 'O que é exatamente o Método DEL?',
    a: 'O Método DEL (Decomposição de Estrutura de Linguagem) é uma metodologia que permite criar agentes de inteligência artificial com identidade textual própria. Em vez de respostas genéricas, o DEL faz com que a IA fale com o estilo, vocabulário e intencionalidade de uma marca, autor ou instituição.',
  },
  {
    q: 'Para quem o Método DEL é indicado?',
    a: 'Para profissionais e organizações que desejam personalizar sua comunicação automatizada com precisão e autenticidade. Ideal para marketing, jurídico, educação, atendimento, RH e branding.',
  },
  {
    q: 'Quais são os principais benefícios do Método DEL?',
    a: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Reduz drasticamente o risco de alucinação da IA</li>
        <li>Garante consistência na linguagem e no tom de voz</li>
        <li>Escala a produção de conteúdo com identidade autoral</li>
        <li>Permite auditoria e governança sobre a comunicação automatizada</li>
        <li>Potencializa o valor da linguagem como ativo estratégico</li>
      </ul>
    ),
  },
  {
    q: 'O DEL é difícil de aplicar? Precisa saber programação?',
    a: 'Não. O método foi pensado para profissionais não técnicos: coleta de textos, análise sintática, semântica e lexical, e criação de arquivos que orientam o comportamento da IA — sem codificar nada.',
  },
  {
    q: 'Quais resultados reais posso esperar ao aplicar o Método DEL?',
    a: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Redução de inconsistências na comunicação institucional</li>
        <li>Economia de tempo na produção de textos e atendimentos</li>
        <li>Aumento na confiança em IAs internas e externas</li>
        <li>Fortalecimento do posicionamento de marca via linguagem</li>
        <li>Maior adesão dos usuários à experiência automatizada</li>
      </ul>
    ),
  },
];

const SHARE_URL = `${SITE_URL}/livro-del.html`;

const LivroDel = () => {
  const { trackCTA } = useTrackCTA();
  const [openFaq, setOpenFaq] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      trackCTA('livro_del_copy_link', 'livro_del_hero');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="O código invisível dos superagentes de IA — Jefferson Lobo | Método DEL"
        description="Transforme IA genérica em agentes personalizados com DNA linguístico fiel à sua marca. O Método DEL, em livro — e-book ou impresso."
        path="/livro-del"
        ogImage={`${SITE_URL}/og/livro-del.jpg`}
      />
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden pt-32 pb-16 bg-brand-grid">
          <div className="absolute inset-0 z-0">
            <img
              src={jeffersonPortrait}
              alt=""
              className="w-full h-full object-cover object-[70%_15%] opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-3xl text-center space-y-7">
              <span className="section-kicker">Método exclusivo (livro)</span>

              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl">
                <span className="text-primary">O código invisível.</span>
                <br />
                dos superagentes de inteligência artificial
              </h1>

              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                Transforme IA genérica em agentes personalizados com DNA linguístico fiel à sua
                marca, sua voz e seu propósito.
              </p>

              <blockquote className="font-serif italic text-xl sm:text-2xl mx-auto max-w-md">
                "Não é sobre usar IA. É sobre fazer a IA falar com sua identidade."
              </blockquote>

              <div className="mx-auto max-w-[230px] sm:max-w-[260px]">
                <img src={capaFlutuante} alt="Capa do livro O código invisível" className="w-full" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  asChild
                  className="text-base px-8 py-6"
                  onClick={() => trackCTA('livro_del_hero_ebook', 'livro_del_hero')}
                >
                  <a href={EBOOK_URL}>Quero o e-book — R$ 47</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base px-8 py-6 border-foreground/25 hover:bg-foreground/5"
                  onClick={() => trackCTA('livro_del_hero_impresso', 'livro_del_hero')}
                >
                  <a href={IMPRESSO_URL}>Quero o livro impresso</a>
                </Button>
              </div>

              <p
                className="text-xs text-muted-foreground uppercase tracking-widest"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                método del · decomposição de estrutura de linguagem
              </p>
            </div>
          </div>
        </section>

        {/* AUTOR */}
        <section className="bg-card py-16 sm:py-20 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl grid sm:grid-cols-[auto_1fr] gap-8 items-center text-center sm:text-left">
              <img
                src={jeffersonPortrait}
                alt="Jefferson Lobo"
                className="w-28 h-28 rounded-full object-cover object-[50%_15%] border border-border mx-auto sm:mx-0"
              />
              <div>
                <span className="section-kicker">Criador do Método DEL</span>
                <h2 className="font-serif text-3xl mt-3 mb-3">
                  Jefferson <span className="highlight-yellow">Lobo</span>
                </h2>
                <p className="text-muted-foreground text-[15px] max-w-xl">
                  Iniciou sua trajetória profissional em 1992, na imprensa escrita, e ao longo de
                  mais de três décadas consolidou uma carreira que integra jornalismo,
                  publicidade, marketing estratégico, campanhas eleitorais e inteligência aplicada
                  à linguagem. Criador do Método DEL, desenvolve agentes de IA com identidade
                  textual e função estratégica. Atualmente é Head Executivo de Marketing do
                  Sistema Fiep, e defende a personalização como princípio ético e técnico para o
                  futuro da inteligência artificial aplicada à linguagem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-xl text-center mb-14">
              <span className="section-kicker">Por que o Método DEL</span>
              <h2 className="display-title text-3xl sm:text-4xl mt-4">
                Seis razões pra sua IA parar de soar genérica
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {BENEFICIOS.map((b) => (
                <div
                  key={b.n}
                  className="rounded-xl border border-border bg-card p-7 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.5)]"
                >
                  <div
                    className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[13px] font-semibold mb-4"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {b.n}
                  </div>
                  <h3 className="font-bold text-base mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O LIVRO */}
        <section className="bg-card py-20 sm:py-24 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl grid lg:grid-cols-2 gap-14 items-center">
              <div className="max-w-xs mx-auto">
                <img src={capaFlutuante} alt="Capa do livro O código invisível" className="w-full" />
              </div>
              <div>
                <span className="section-kicker">O livro</span>
                <h2 className="display-title text-3xl sm:text-4xl mt-4 mb-3">
                  Descubra como personalizar sua IA com rigor técnico e estilo inconfundível
                </h2>
                <p className="font-serif italic text-lg text-primary border-l-2 border-primary pl-4 my-5">
                  Dos superagentes de inteligência artificial
                </p>
                <p className="text-muted-foreground max-w-md mb-7">
                  O Método DEL mostra o caminho pra sair da incerteza e construir agentes
                  inteligentes com base sólida, linguagem estruturada e proteção reputacional
                  garantida.
                </p>
                <Button
                  size="lg"
                  asChild
                  onClick={() => trackCTA('livro_del_showcase_impresso', 'livro_del_showcase')}
                >
                  <a href={IMPRESSO_URL}>Quero o impresso</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* PREÇO */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="section-kicker">E-book</span>
            </div>
            <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 sm:p-12 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.55)] grid sm:grid-cols-[1fr_auto] gap-7 items-center text-center sm:text-left">
              <div>
                <p
                  className="text-xs uppercase tracking-widest text-muted-foreground mb-3"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Adaptável a qualquer dispositivo
                </p>
                <p className="font-serif text-5xl">
                  R$ 47<span className="text-2xl">,00</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">Em até 3 parcelas</p>
              </div>
              <Button
                size="lg"
                asChild
                onClick={() => trackCTA('livro_del_pricing_ebook', 'livro_del_pricing')}
              >
                <a href={EBOOK_URL}>Quero o e-book agora</a>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card py-20 sm:py-24 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="section-kicker">Perguntas frequentes</span>
            </div>
            <div className="mx-auto max-w-2xl">
              <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq}>
                {FAQS.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-border">
                    <AccordionTrigger className="text-left font-bold text-base hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-[14.5px]">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LivroDel;
