import { Link } from 'react-router-dom';
import { Download, FileText, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MATERIAIS, MATERIAIS_KICKER } from '@/data/materiais';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const Materiais = () => {
  const { trackCTA } = useTrackCTA();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Materiais do livro | Método DEL — Jefferson Lobo"
        description="Baixe grátis os materiais complementares do livro O código invisível dos superagentes de IA: protocolo de auditoria de fidelidade autoral e templates dos três arquivos DEL."
        path="/materiais"
      />
      <Header />

      <main className="flex-1 pt-28 pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-primary"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {MATERIAIS_KICKER}
            </p>
            <h1 className="display-title mt-4 text-4xl sm:text-5xl md:text-6xl">
              Materiais do <span className="text-primary">livro</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Anexos operacionais do livro <em>O código invisível dos superagentes de
              inteligência artificial</em>, liberados para consulta online e download direto —
              sem cadastro.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {MATERIAIS.map((material) => (
              <Card
                key={material.slug}
                className="flex flex-col gap-5 border-primary/20 bg-card p-6 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl leading-snug">{material.title}</h2>
                  <p className="text-muted-foreground">{material.summary}</p>
                </div>
                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    onClick={() => trackCTA(material.ctaName, 'materiais_index')}
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
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Link to={`/materiais/${material.slug}`}>
                      <BookOpen className="mr-2 h-5 w-5" />
                      Ler online
                    </Link>
                  </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Materiais;
