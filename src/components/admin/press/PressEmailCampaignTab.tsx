import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Eye, AlertCircle } from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { renderTemplate } from '@/lib/press-utils';

type Props = {
  selectedContacts: PressContact[];
  onClearSelection: () => void;
};

const DEFAULT_SUBJECT = `Pauta para {{veiculo}} — {{primeiro_nome}}, posso compartilhar?`;
const DEFAULT_HTML = `<p>Olá <strong>{{primeiro_nome}}</strong>,</p>
<p>Sou Jefferson Lobo, especialista em IA. Estou enviando uma pauta que pode interessar à <strong>{{veiculo}}</strong> ({{municipio}}/{{regiao}}):</p>
<p><em>[descreva sua pauta aqui — substitua antes de enviar]</em></p>
<p>Posso compartilhar mais detalhes, dados ou marcar uma conversa rápida?</p>
<p>Abraço,<br>Jefferson Lobo</p>`;

// Limite por disparo: edge function tem timeout ~150s. Com ~250ms/email = 100 cabem com folga.
// Para enviar mais que isso, divida em múltiplos disparos (ainda dentro do limite Brevo Free de 300/dia).
const BATCH_LIMIT = 100;

export const PressEmailCampaignTab = ({ selectedContacts, onClearSelection }: Props) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; skipped: number; failed: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const eligible = selectedContacts.filter(c => c.email && !c.opt_out);
  const preview = eligible[0];

  const handleSend = async () => {
    if (!nome.trim() || !subject.trim() || !html.trim()) {
      toast({ title: 'Preencha nome, assunto e corpo', variant: 'destructive' }); return;
    }
    if (!eligible.length) {
      toast({ title: 'Nenhum contato elegível (com email e sem opt-out)', variant: 'destructive' }); return;
    }
    if (eligible.length > BATCH_LIMIT) {
      toast({
        title: `Lote acima do limite Brevo Free`,
        description: `Selecione no máximo ${BATCH_LIMIT} contatos por disparo (você tem ${eligible.length}).`,
        variant: 'destructive',
      });
      return;
    }
    if (!confirm(`Disparar email para ${eligible.length} contatos via Brevo? Isso não pode ser desfeito.`)) return;

    setSending(true); setResult(null);
    try {
      const { data: campaign, error: cErr } = await supabase
        .from('press_campaigns')
        .insert({
          tipo: 'email', nome: nome.trim(), assunto: subject, corpo: html,
          total_alvo: eligible.length, status: 'em_envio',
        })
        .select('id').single();
      if (cErr || !campaign) throw new Error(cErr?.message || 'Falha ao criar campanha');

      const { data, error } = await supabase.functions.invoke('send-press-email', {
        body: {
          campaign_id: campaign.id,
          contact_ids: eligible.map(c => c.id),
          subject, html,
        },
      });
      if (error) throw error;
      setResult(data);
      toast({
        title: 'Disparo finalizado',
        description: `${data.sent} enviados · ${data.failed} erros · ${data.skipped} pulados`,
      });
      onClearSelection();
    } catch (e) {
      toast({ title: 'Erro no disparo', description: e instanceof Error ? e.message : 'erro', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 border-l-4 border-blue-500 bg-blue-500/5 text-sm">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            Disparo via <strong>Brevo</strong> (plano Free: <strong>300 emails/dia</strong>). Remetente:{' '}
            <code>contato@jeffersonlobo.tech</code>. Para entregabilidade ideal, valide SPF/DKIM do domínio
            no painel Brevo (Senders → Domains).
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Selecionados</div>
          <div className="text-2xl font-black">{selectedContacts.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Elegíveis (email + opt-in)</div>
          <div className="text-2xl font-black text-primary">{eligible.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Limite por lote</div>
          <div className="text-2xl font-black">{BATCH_LIMIT}</div>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div>
          <label className="text-sm font-bold">Nome interno da campanha</label>
          <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pauta congresso ADJORI-PR" />
        </div>
        <div>
          <label className="text-sm font-bold">Assunto</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-bold">Corpo HTML</label>
          <Textarea value={html} onChange={e => setHtml(e.target.value)} rows={10} className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground mt-1">
            Variáveis: <code>{`{{primeiro_nome}}`}</code> <code>{`{{contato}}`}</code> <code>{`{{veiculo}}`}</code>{' '}
            <code>{`{{municipio}}`}</code> <code>{`{{regiao}}`}</code> <code>{`{{cargo}}`}</code> <code>{`{{meio}}`}</code>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(p => !p)} disabled={!preview}>
            <Eye className="w-4 h-4 mr-1" /> {showPreview ? 'Ocultar' : 'Ver'} preview
          </Button>
          <Button onClick={handleSend} disabled={sending || !eligible.length} className="ml-auto">
            <Send className="w-4 h-4 mr-1" />
            {sending ? 'Enviando...' : `Disparar para ${eligible.length}`}
          </Button>
        </div>

        {showPreview && preview && (
          <div className="border-2 border-dashed p-3 rounded space-y-2 bg-muted/30">
            <div className="text-xs"><strong>Para:</strong> {preview.email} ({preview.contato || preview.veiculo})</div>
            <div className="text-xs"><strong>Assunto:</strong> {renderTemplate(subject, preview)}</div>
            <div className="bg-white p-3 rounded text-sm text-black" dangerouslySetInnerHTML={{ __html: renderTemplate(html, preview) }} />
          </div>
        )}

        {result && (
          <div className="flex gap-2 pt-2 border-t">
            <Badge variant="default"><Mail className="w-3 h-3 mr-1" />{result.sent} enviados</Badge>
            <Badge variant="destructive">{result.failed} erros</Badge>
            <Badge variant="secondary">{result.skipped} pulados</Badge>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PressEmailCampaignTab;
