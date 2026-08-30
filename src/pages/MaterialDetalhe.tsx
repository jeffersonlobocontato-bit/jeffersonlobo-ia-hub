import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Download } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import NotFound from '@/pages/NotFound';
import { MaterialBlocks } from '@/components/materiais/MaterialBlocks';
import { MATERIAIS_KICKER, getMaterial, materialToPlainText } from '@/data/materiais';
import { slugifyHeading } from '@/lib/materiais-utils';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { useToast } from '@/hooks/use-toast';

const MaterialDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const material = getMaterial(slug);
  const { trackCTA } = useTrackCTA();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!material) return <NotFound />;

  const headings = material.blocks.filter((block) => block.type === 'h2') as {
    type: 'h2';
    text: string;
  }[];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(materialToPlainText(material));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({
        title: 'Não foi possível copiar',
        description: 'Selecione o texto manualmente ou baixe o PDF.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`${material.title} | Jefferson Lobo`}
        description={material.seoDescription}
        path={`/materiais/${material.slug}`}
        ogType="article"
      />
      <Header />

      <main className="flex-1 pt-28 pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/materiais"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Materiais do livro
            </Link>

            <p
              className="mt-8 text-[11px] font-semibold uppercase tracking-wider text-primary"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {MATERIAIS_KICKER}
            </p>
            <h1 className="display-title mt-4 text-3xl sm:text-4xl md:text-5xl">
              {material.title}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">{material.summary}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                onClick={() => trackCTA(material.ctaName, 'material_detalhe')}
              >
                <a
                  href={material.pdfUrl}
                  download={material.pdfFilename}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Baixar PDF
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copiar texto
                  </>
                )}
              </Button>
            </div>

            {headings.length > 1 && (
              <nav
                aria-label="Índice do material"
                className="mt-10 rounded-lg border border-border bg-muted/40 p-5"
              >
                <p
                  className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground/70"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Neste material
                </p>
                <ul className="space-y-2">
                  {headings.map((heading) => (
                    <li key={heading.text}>
                      <a
                        href={`#${slugifyHeading(heading.text)}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <article className="mt-12">
              <MaterialBlocks blocks={material.blocks} />
            </article>

            <p className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
              Extraído de <em>O código invisível dos superagentes de inteligência
              artificial</em>, de Jefferson Lobo.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MaterialDetalhe;
