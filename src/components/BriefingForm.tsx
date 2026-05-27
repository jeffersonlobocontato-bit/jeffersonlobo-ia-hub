import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MessageCircle, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { Link } from 'react-router-dom';

const briefingSchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome').max(120),
  empresa: z.string().trim().max(160).optional().or(z.literal('')),
  cargo: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('E-mail inválido').max(255),
  whatsapp: z.string().trim().max(40).optional().or(z.literal('')),
  tipo: z.enum(['palestra', 'workshop', 'consultoria', 'imersao', 'outro']),
  data_evento: z.string().optional().or(z.literal('')),
  formato: z.string().trim().max(60).optional().or(z.literal('')),
  publico: z.string().trim().max(120).optional().or(z.literal('')),
  cidade: z.string().trim().max(120).optional().or(z.literal('')),
  mensagem: z.string().trim().max(2000).optional().or(z.literal('')),
});

const BriefingForm = () => {
  const { toast } = useToast();
  const { trackCTA } = useTrackCTA();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nome: '', empresa: '', cargo: '', email: '', whatsapp: '',
    tipo: 'palestra', data_evento: '', formato: '', publico: '', cidade: '', mensagem: '',
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = briefingSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast({ title: 'Verifique os campos', description: first.message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const payload = { ...parsed.data, data_evento: parsed.data.data_evento || null };
    const { error } = await supabase.from('briefing_requests').insert(payload as any);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Não foi possível enviar', description: error.message, variant: 'destructive' });
      return;
    }
    trackCTA('briefing_submit', 'briefing_form');
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="panel-dark mx-auto max-w-3xl p-8 md:p-12 text-center space-y-5">
        <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
        <h3 className="display-title text-3xl md:text-4xl">Recebido. Vou responder em até 24h.</h3>
        <p className="text-muted-foreground">
          Enquanto isso, que tal usar 8 minutos para descobrir o nível de maturidade em IA da sua empresa?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg">
            <Link to="/teste-ia">Fazer Teste de Maturidade</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="https://wa.me/5545999864213" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp direto
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel-dark mx-auto max-w-4xl p-6 md:p-10 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Seu nome *">
          <Input value={form.nome} onChange={(e) => update('nome', e.target.value)} required maxLength={120} />
        </Field>
        <Field label="E-mail *">
          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required maxLength={255} />
        </Field>
        <Field label="Empresa">
          <Input value={form.empresa} onChange={(e) => update('empresa', e.target.value)} maxLength={160} />
        </Field>
        <Field label="Cargo">
          <Input value={form.cargo} onChange={(e) => update('cargo', e.target.value)} maxLength={120} />
        </Field>
        <Field label="WhatsApp">
          <Input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="(45) 99999-9999" maxLength={40} />
        </Field>
        <Field label="O que você procura? *">
          <Select value={form.tipo} onValueChange={(v) => update('tipo', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="palestra">Palestra / Keynote</SelectItem>
              <SelectItem value="imersao">Imersão executiva (nivelamento + governança)</SelectItem>
              <SelectItem value="consultoria">Consultoria estratégica (conversa com liderança)</SelectItem>
              <SelectItem value="workshop">Workshop para time</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Data prevista do evento">
          <Input type="date" value={form.data_evento} onChange={(e) => update('data_evento', e.target.value)} />
        </Field>
        <Field label="Formato">
          <Select value={form.formato || 'presencial'} onValueChange={(v) => update('formato', v)}>
            <SelectTrigger><SelectValue placeholder="Presencial / Online / Híbrido" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tamanho do público / time">
          <Input value={form.publico} onChange={(e) => update('publico', e.target.value)} placeholder="Ex.: 200 pessoas, time de 25" maxLength={120} />
        </Field>
        <Field label="Cidade">
          <Input value={form.cidade} onChange={(e) => update('cidade', e.target.value)} maxLength={120} />
        </Field>
      </div>
      <Field label="Conte o contexto (objetivo, dores, expectativa)">
        <Textarea
          value={form.mensagem}
          onChange={(e) => update('mensagem', e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Ex.: vamos fazer uma convenção de líderes em março, queremos abrir com IA aplicada ao varejo..."
        />
      </Field>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" size="lg" disabled={submitting} className="flex-1">
          <Send className="w-4 h-4 mr-2" />
          {submitting ? 'Enviando...' : 'Solicitar proposta'}
        </Button>
        <Button asChild type="button" size="lg" variant="outline">
          <a
            href="https://wa.me/5545999864213"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTA('briefing_whatsapp', 'briefing_form')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Prefiro WhatsApp
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Resposta em até 24h úteis. Seus dados ficam comigo — sem disparo de marketing.
      </p>
    </form>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default BriefingForm;
