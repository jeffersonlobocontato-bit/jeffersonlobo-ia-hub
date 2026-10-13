import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, ExternalLink, RotateCcw, Upload, UserPlus, X } from 'lucide-react';
import { db } from '@/lib/cursos';
import AdminLeadsAcademia from './AdminLeadsAcademia';
import { PRODUTOS, produtoPorSlug } from '@/content/cursos/produtos';

type Acesso = {
  id: string;
  email: string;
  nome: string | null;
  status: 'ativo' | 'revogado';
  origem: 'hotmart' | 'manual' | 'mercadopago';
  hotmart_transacao: string | null;
  created_at: string;
};
type Pergunta = {
  id: string;
  email: string | null;
  aula_slug: string | null;
  pergunta: string;
  resposta: string | null;
  created_at: string;
};
type Evento = { id: string; evento: string | null; email: string | null; acao: string | null; erro: string | null; created_at: string };
type Pedido = {
  id: string;
  email: string;
  nome: string | null;
  valor: number;
  status: string;
  forma_pagamento: string | null;
  parcelas: number | null;
  created_at: string;
};

const data = (s: string) => new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// Aba "Cursos" do /admin: alunos, configuração (Hotmart e vídeos do Bunny),
// materiais do bucket privado, perguntas ao Tutor e eventos da Hotmart.
const AdminCursosTab = () => {
  const { toast } = useToast();
  // produto em foco: o curso ou um dos pockets (cada um tem alunos, pedidos e materiais próprios)
  const [slug, setSlug] = useState('ilha');
  const curso = produtoPorSlug(slug) ?? PRODUTOS[0];
  const comVideo = curso.aulas.filter((a) => !a.semVideo);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [arquivos, setArquivos] = useState<Set<string>>(new Set());
  const [novoEmail, setNovoEmail] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [filtro, setFiltro] = useState('');
  const [enviando, setEnviando] = useState<string | null>(null);

  const erro = (titulo: string, e: { message: string } | null) =>
    e && toast({ title: titulo, description: e.message, variant: 'destructive' });

  const carregar = async () => {
    const [a, c, p, ev, pd] = await Promise.all([
      db.from('curso_acessos').select('*').eq('curso_slug', curso.slug).order('created_at', { ascending: false }),
      db.from('curso_config').select('chave, valor').eq('curso_slug', curso.slug),
      db
        .from('curso_tutor_mensagens')
        .select('id, email, aula_slug, pergunta, resposta, created_at')
        .eq('curso_slug', curso.slug)
        .order('created_at', { ascending: false })
        .limit(50),
      db.from('hotmart_eventos').select('id, evento, email, acao, erro, created_at').order('created_at', { ascending: false }).limit(20),
      db
        .from('curso_pedidos')
        .select('id, email, nome, valor, status, forma_pagamento, parcelas, created_at')
        .eq('curso_slug', curso.slug)
        .order('created_at', { ascending: false })
        .limit(40),
    ]);
    erro('Erro ao carregar alunos', a.error);
    setAcessos((a.data ?? []) as Acesso[]);
    setConfig(Object.fromEntries((c.data ?? []).map((r: any) => [r.chave, r.valor])));
    setPerguntas((p.data ?? []) as Pergunta[]);
    setEventos((ev.data ?? []) as Evento[]);
    setPedidos((pd.data ?? []) as Pedido[]);

    const presentes = new Set<string>();
    const pastas = Array.from(new Set(curso.aulas.flatMap((x) => x.materiais.map((m) => m.caminho.split('/').slice(0, -1).join('/')))));
    for (const pasta of pastas) {
      const { data: lista } = await db.storage.from('cursos').list(pasta);
      (lista ?? []).forEach((f: any) => presentes.add(`${pasta}/${f.name}`));
    }
    setArquivos(presentes);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const liberar = async () => {
    const email = novoEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast({ title: 'Confira o e-mail', variant: 'destructive' });
    const { error } = await db
      .from('curso_acessos')
      .upsert(
        { email, nome: novoNome.trim() || null, curso_slug: curso.slug, status: 'ativo', origem: 'manual' },
        { onConflict: 'email,curso_slug' },
      );
    if (error) return erro('Não liberou', error);
    toast({ title: 'Acesso liberado', description: `${email} já pode entrar em /cursos/entrar` });
    setNovoEmail('');
    setNovoNome('');
    carregar();
  };

  const mudarStatus = async (a: Acesso, status: Acesso['status']) => {
    const { error } = await db.from('curso_acessos').update({ status }).eq('id', a.id);
    if (error) return erro('Não salvou', error);
    carregar();
  };

  const salvarConfig = async (chave: string, valor: string) => {
    const { error } = await db
      .from('curso_config')
      .upsert({ curso_slug: curso.slug, chave, valor: valor.trim() }, { onConflict: 'curso_slug,chave' });
    if (error) return erro('Não salvou', error);
    toast({ title: 'Salvo' });
  };

  const enviarMaterial = async (caminho: string, arquivo: File) => {
    setEnviando(caminho);
    const { error } = await db.storage.from('cursos').upload(caminho, arquivo, { upsert: true, contentType: arquivo.type || undefined });
    setEnviando(null);
    if (error) return erro('Upload falhou', error);
    toast({ title: 'Material enviado' });
    carregar();
  };

  const visiveis = useMemo(() => {
    const f = filtro.trim().toLowerCase();
    return f ? acessos.filter((a) => a.email.includes(f) || (a.nome ?? '').toLowerCase().includes(f)) : acessos;
  }, [acessos, filtro]);
  const ativos = acessos.filter((a) => a.status === 'ativo').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Produto">
        {PRODUTOS.map((p) => (
          <Button
            key={p.slug}
            size="sm"
            variant={p.slug === slug ? 'default' : 'outline'}
            onClick={() => setSlug(p.slug)}
            role="tab"
            aria-selected={p.slug === slug}
          >
            {p.tipo === 'pocket' ? p.nome.replace(/ · .*/, '') : p.nome}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{curso.nome}</h2>
          <p className="text-sm text-muted-foreground">
            {ativos} {curso.tipo === 'pocket' ? 'comprador(es) avulso(s)' : 'aluno(s)'} com acesso ativo ·{' '}
            {perguntas.length ? `${perguntas.length} perguntas recentes ao Tutor` : 'nenhuma pergunta ao Tutor ainda'}
            {curso.tipo === 'pocket' && ' · quem tem a Ilha também acessa este pocket'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/cursos/${curso.slug}/aulas`} target="_blank" rel="noopener">
              Ver a área do aluno <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={curso.pagina} target="_blank" rel="noopener">
              Página de vendas <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Liberar acesso à mão</h3>
        <p className="text-sm text-muted-foreground">
          Para cortesias, para o login de teste que a Hotmart pede na aprovação e para quem comprou com outro e-mail. A pessoa entra em
          /cursos/entrar com este e-mail.
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
          <div className="space-y-1">
            <Label htmlFor="novo-email">E-mail</Label>
            <Input id="novo-email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="aluno@exemplo.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="novo-nome">Nome (opcional)</Label>
            <Input id="novo-nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
          </div>
          <Button onClick={liberar}>
            <UserPlus className="mr-2 h-4 w-4" /> Liberar
          </Button>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Alunos</h3>
          <Input className="max-w-xs" placeholder="Buscar por e-mail ou nome" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">E-mail</th>
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Origem</th>
                <th className="py-2 pr-3">Desde</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {visiveis.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="py-2 pr-3 break-all">{a.email}</td>
                  <td className="py-2 pr-3">{a.nome ?? '—'}</td>
                  <td className="py-2 pr-3">{a.origem === 'hotmart' ? `Hotmart ${a.hotmart_transacao ?? ''}` : 'Manual'}</td>
                  <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{data(a.created_at)}</td>
                  <td className="py-2 pr-3">
                    {a.status === 'ativo' ? (
                      <span className="text-green-500">Ativo</span>
                    ) : (
                      <span className="text-destructive">Revogado</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {a.status === 'ativo' ? (
                      <Button size="sm" variant="ghost" onClick={() => mudarStatus(a, 'revogado')}>
                        <X className="mr-1 h-4 w-4" /> Revogar
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => mudarStatus(a, 'ativo')}>
                        <RotateCcw className="mr-1 h-4 w-4" /> Reativar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!visiveis.length && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhum aluno ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {curso.tipo === 'curso' && (
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold">Hotmart e vídeos</h3>
          <ConfigCampo
            rotulo="ID do produto na Hotmart"
            ajuda="Aparece em Produtos › o curso › ID do produto. O webhook usa este número para saber de qual curso é a compra."
            valor={config.hotmart_produto_id ?? ''}
            onSalvar={(v) => salvarConfig('hotmart_produto_id', v)}
          />
          <ConfigCampo
            rotulo="ID da biblioteca no Bunny Stream"
            ajuda="Bunny › Stream › a sua biblioteca › API: Library ID (só números)."
            valor={config.bunny_library_id ?? ''}
            onSalvar={(v) => salvarConfig('bunny_library_id', v)}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {comVideo.map((a) => (
              <ConfigCampo
                key={a.slug}
                rotulo={`Vídeo · Aula ${a.numero} · ${a.titulo}`}
                ajuda="Bunny › o vídeo › Video ID (o código longo)."
                valor={config[`video:${a.slug}`] ?? ''}
                onSalvar={(v) => salvarConfig(`video:${a.slug}`, v)}
              />
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Materiais para baixar</h3>
        <p className="text-sm text-muted-foreground">
          Ficam num armazenamento privado: só quem tem acesso ao curso baixa, por um link que vence em 1 hora.
        </p>
        <div className="divide-y divide-border">
          {curso.aulas.flatMap((a) =>
            a.materiais.map((m) => {
              const tem = arquivos.has(m.caminho);
              return (
                <div key={m.caminho} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-medium">
                      {a.numero ? `Aula ${a.numero}` : 'Bônus'} · {m.nome}
                    </div>
                    <div className="text-xs text-muted-foreground break-all">{m.caminho}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {tem ? (
                      <span className="text-sm text-green-500 flex items-center">
                        <Check className="mr-1 h-4 w-4" /> Enviado
                      </span>
                    ) : (
                      <span className="text-sm text-amber-500">Falta enviar</span>
                    )}
                    <Button size="sm" variant="outline" asChild disabled={enviando === m.caminho}>
                      <label className="cursor-pointer">
                        <Upload className="mr-1 h-4 w-4" /> {enviando === m.caminho ? 'Enviando…' : tem ? 'Trocar' : 'Enviar'}
                        <input
                          type="file"
                          className="hidden"
                          accept={m.tipo === 'pdf' ? 'application/pdf' : '.zip,application/zip'}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) enviarMaterial(m.caminho, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Perguntas ao Tutor</h3>
        <p className="text-sm text-muted-foreground">
          As 50 mais recentes. Mostram onde os alunos travam: bom material para melhorar as aulas.
        </p>
        <div className="space-y-3">
          {perguntas.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-3 text-sm space-y-1">
              <div className="text-xs text-muted-foreground">
                {data(p.created_at)} · {p.email ?? '—'} · {p.aula_slug ?? 'sem aula'}
              </div>
              <div className="font-medium">{p.pergunta}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{p.resposta}</div>
            </div>
          ))}
          {!perguntas.length && <p className="text-sm text-muted-foreground">Nenhuma pergunta ainda.</p>}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Pedidos pelo Mercado Pago</h3>
        <p className="text-xs text-muted-foreground">
          Cada clique em comprar vira um pedido. Aprovado libera o acesso sozinho; reembolsado ou contestado tira.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {pedidos.map((pd) => (
                <tr key={pd.id} className="border-t border-border">
                  <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{data(pd.created_at)}</td>
                  <td className="py-2 pr-3 break-all">
                    {pd.email}
                    {pd.nome ? <span className="text-muted-foreground"> · {pd.nome}</span> : null}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap tabular-nums">R$ {Number(pd.valor).toFixed(2).replace('.', ',')}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                    {pd.forma_pagamento ?? '-'}
                    {pd.parcelas && pd.parcelas > 1 ? ` · ${pd.parcelas}x` : ''}
                  </td>
                  <td
                    className={`py-2 whitespace-nowrap ${pd.status === 'aprovado' ? 'text-primary font-medium' : pd.status === 'recusado' || pd.status === 'reembolsado' || pd.status === 'contestado' ? 'text-destructive' : 'text-muted-foreground'}`}
                  >
                    {pd.status}
                  </td>
                </tr>
              ))}
              {!pedidos.length && (
                <tr>
                  <td className="py-4 text-muted-foreground">Nenhum pedido ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Últimos eventos da Hotmart</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{data(e.created_at)}</td>
                  <td className="py-2 pr-3">{e.evento}</td>
                  <td className="py-2 pr-3 break-all">{e.email}</td>
                  <td className={`py-2 ${e.erro ? 'text-destructive' : 'text-muted-foreground'}`}>{e.erro ?? e.acao}</td>
                </tr>
              ))}
              {!eventos.length && (
                <tr>
                  <td className="py-4 text-muted-foreground">Nenhum evento recebido ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminLeadsAcademia />
    </div>
  );
};

function ConfigCampo({ rotulo, ajuda, valor, onSalvar }: { rotulo: string; ajuda: string; valor: string; onSalvar: (v: string) => void }) {
  const [v, setV] = useState(valor);
  useEffect(() => setV(valor), [valor]);
  return (
    <div className="space-y-1">
      <Label>{rotulo}</Label>
      <div className="flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} />
        <Button variant="outline" onClick={() => onSalvar(v)} disabled={v === valor}>
          Salvar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
    </div>
  );
}

export default AdminCursosTab;
