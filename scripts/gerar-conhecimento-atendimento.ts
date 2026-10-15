// Monta a base de conhecimento do assistente de atendimento no Telegram
// (função telegram-atendimento) a partir do que o site já publica:
//   - public/llms.txt: quem é o Jefferson, serviços, livro, cursos e páginas;
//   - src/content/cursos: preços, lotes, bônus, aulas, pockets, garantia,
//     prazo de acesso, termos de uso e política de privacidade.
// O conteúdo das aulas (Tutor) entra direto na função, pelos arquivos de
// _shared/cursos. Rode de novo sempre que mudar preço, lote, termos ou
// páginas do site:  bun scripts/gerar-conhecimento-atendimento.ts
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { ESCOLA, BOT_ATENDIMENTO } from '../src/content/cursos/escola';
import { CURSOS, LIVRO_DEL } from '../src/content/cursos/ilha';
import { POCKETS, reais } from '../src/content/cursos/pockets';
import { ISCA_SKILLS } from '../src/content/cursos/iscas';
import { TERMOS, VERSAO, ATUALIZADO_EM } from '../src/content/cursos/termos';
import { PRIVACIDADE, VERSAO_PRIVACIDADE, PRIVACIDADE_ATUALIZADA_EM } from '../src/content/cursos/privacidade';

const SITE = 'https://jeffersonlobo.tech';
const brl = (n: number) => reais(n).replace(' ', ' ');
const data = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(
    new Date(iso),
  );

const partes: string[] = [];

partes.push(`# O SITE (jeffersonlobo.tech)\n\n${readFileSync(resolve('public/llms.txt'), 'utf8').trim()}`);

const cursos = CURSOS.map((c) => {
  const aulas = c.aulas
    .filter((a) => a.numero !== null)
    .map((a) => `- Aula ${a.numero} · ${a.titulo}${a.duracao ? ` (${a.duracao})` : ''}: ${a.resumo}`)
    .join('\n');
  return `## Curso: ${c.nome}
Página de vendas: ${SITE}${c.vitrine.pagina}
${c.chamada}. ${c.descricao}
Preço: ${brl(c.precos.lote1)} no Lote 1, até ${data(c.precos.fimLote1)} (horário de Brasília). Depois disso, ${brl(c.precos.lote2)} no Lote 2. Pagamento único, sem mensalidade.
Bônus inclusos: ${c.bonus.nome} (vendido avulso por ${brl(c.bonus.valor)}) e ${c.bonusPockets.nome} (${brl(c.bonusPockets.valor)} avulsos).
O que vem: ${c.vitrine.destaques.join('; ')}.
Garantia: ${c.garantiaDias} dias.
Aulas:
${aulas}`;
});

const pockets = POCKETS.map(
  (p) => `## Pocket ${p.numero}: ${p.nome}
Página: ${SITE}${p.pagina}
Preço: ${brl(p.preco)}, pagamento único. Tutorial em PDF com ${p.pdf.paginas} páginas, ${p.pdf.telas} telas do Claude em português e ${p.pdf.modelos} modelo(s) para copiar.
${p.promessa} ${p.dor}
É para quem: ${p.paraQuem.join('; ')}.
Plano do Claude: ${p.plano}
Passos: ${p.passos.map((s) => s.titulo).join('; ')}.`,
);

partes.push(`# ACADEMIA JEFFERSONLOBO.TECH (cursos, pockets e livro)

Vitrine: ${SITE}/cursos · Área do aluno: ${SITE}/cursos/entrar · Termos: ${SITE}/cursos/termos · Privacidade: ${SITE}/cursos/privacidade

## Como funciona a compra e o acesso
- Pagamento na página segura do Mercado Pago: Pix, boleto ou cartão de crédito em até 12x. Os dados do cartão não passam pelo site.
- No Pix, a aprovação sai em segundos; no boleto, quando o banco confirma o pagamento.
- Assim que o pagamento é aprovado, chega no e-mail informado na compra o link da área do aluno. Entra-se só com o e-mail, sem senha: o site manda um link de acesso.
- Se o e-mail não chegou: conferir o spam e a aba Promoções, e tentar entrar em ${SITE}/cursos/entrar com o mesmo e-mail da compra. Se ainda assim não entrar, é caso para o Jefferson.
- Prazo de acesso aos cursos: ${ESCOLA.prazoAcesso} a partir da compra. Os arquivos baixados ficam com o aluno, com marca d'água com o e-mail dele.
- Garantia: ${ESCOLA.garantiaDias} dias para pedir reembolso integral, sem justificar.
- Nota fiscal: emitida pela ${ESCOLA.fornecedor.nome}, CNPJ ${ESCOLA.fornecedor.documento}.
- Tutor IA: dentro de cada aula, responde dúvidas sobre o conteúdo do curso, com limite diário de perguntas.
- Atendimento: este assistente, no Telegram (@${BOT_ATENDIMENTO}). Quem não usa o Telegram pode escrever para ${ESCOLA.fornecedor.email}.

${cursos.join('\n\n')}

${pockets.join('\n\n')}

Os 3 pockets também vêm de bônus no curso ${CURSOS[0].nome}; quem comprou o curso já tem os três na área do aluno.

## Livro: ${LIVRO_DEL.nome}
Página: ${SITE}${LIVRO_DEL.pagina}
E-book: ${brl(LIVRO_DEL.ebook.preco)} (${LIVRO_DEL.ebook.url}). Impresso: ${brl(LIVRO_DEL.impresso.preco)} + frete (${LIVRO_DEL.impresso.url}). O livro avulso é vendido pela Hotmart; o e-book também vem de bônus no curso.

## Material grátis
E-book "${ISCA_SKILLS.titulo}" (${ISCA_SKILLS.paginas} páginas), em ${SITE}/cursos#ebook-gratis: a pessoa informa nome, e-mail e WhatsApp e baixa na hora.`);

const secoes = (s: { titulo: string; paragrafos: string[] }[]) => s.map((x) => `## ${x.titulo}\n${x.paragrafos.join('\n')}`).join('\n\n');

partes.push(`# TERMOS DE USO DOS CURSOS (versão ${VERSAO}, ${ATUALIZADO_EM})\n\n${secoes(TERMOS)}`);
partes.push(`# POLÍTICA DE PRIVACIDADE DOS MATERIAIS GRATUITOS (versão ${VERSAO_PRIVACIDADE}, ${PRIVACIDADE_ATUALIZADA_EM})\n\n${secoes(PRIVACIDADE)}`);

const texto = partes.join('\n\n---\n\n');
const saida = resolve('supabase/functions/_shared/atendimento/conhecimento.ts');
writeFileSync(
  saida,
  `// Base de conhecimento do assistente de atendimento (telegram-atendimento).
// Gerado por scripts/gerar-conhecimento-atendimento.ts a partir de public/llms.txt
// e src/content/cursos. Não edite à mão: mude o site e gere de novo.
export const CONHECIMENTO_SITE = ${JSON.stringify(texto)};
`,
);
console.log(`conhecimento do atendimento: ${texto.length} caracteres em ${saida}`);
