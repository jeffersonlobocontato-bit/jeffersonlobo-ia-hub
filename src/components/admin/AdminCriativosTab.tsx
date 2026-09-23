import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpRight, LayoutGrid, Clapperboard } from 'lucide-react';
import AdminVideoEditorTab from './AdminVideoEditorTab';

// Link do artifact "Carrossel Jefferson" (Claude). O Carrossel ainda não foi
// portado para dentro do código do site — enquanto isso não acontece, o card
// abaixo só abre o artifact numa aba nova.
const CARROSSEL_URL = 'https://claude.ai/artifact/J38ieN1HmsZ1ax6gY1hx4H';

type Vista = 'hub' | 'video';

/**
 * Painel "Criativos Jefferson Lobo": ponto único de entrada para as
 * ferramentas de geração de conteúdo (cards/carrossel, vídeos/reels).
 * Cresce por card, não por aba nova — cada ferramenta nova ganha um card
 * aqui em vez de mais um item na lista de abas do Admin.
 */
const AdminCriativosTab = () => {
  const [vista, setVista] = useState<Vista>('hub');

  if (vista === 'video') {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="ghost" onClick={() => setVista('hub')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Criativos
        </Button>
        <AdminVideoEditorTab />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Criativos Jefferson Lobo</h2>
        <p className="text-sm text-muted-foreground">Ferramentas de geração de conteúdo, no mesmo padrão de marca.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex flex-col justify-between p-5">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Cards & Carrossel</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Gera carrossel a partir de notícia ou tema manual, com roteiro de Reel e copies prontas.
              Ainda roda como artifact separado — abre numa aba nova.
            </p>
          </div>
          <Button className="mt-4 w-fit" variant="outline" asChild>
            <a href={CARROSSEL_URL} target="_blank" rel="noopener noreferrer">
              Abrir Carrossel <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clapperboard className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Vídeos & Reels</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Editor de Reels verticais: moldura de gravação, fundo (card de dados ou fundo dinâmico),
              legenda automática, assinatura animada e capa — no padrão do Carrossel.
            </p>
          </div>
          <Button className="mt-4 w-fit" onClick={() => setVista('video')}>
            Abrir editor
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminCriativosTab;
