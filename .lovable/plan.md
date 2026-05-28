# Recomendações estratégicas conectadas aos serviços

## Objetivo
Cada bloco do Plano de Ação 30/60/90 já entrega ações táticas. Vamos somar uma linha curta de "caminho de influência" que conecta a competência ao tipo de entrega que o Jefferson faz — posicionada como **orientação de carreira / o que você pode propor à sua liderança**, nunca como venda. O leitor sai com clareza de qual conversa levar para dentro da empresa, e o nome do Jefferson aparece como referência natural, não como CTA.

## Princípios de tom
- Falar do **papel da pessoa** (PF) ou da **liderança** (PJ) como agente de mudança — não do Jefferson como vendedor.
- Verbo de ação no leitor: "proponha", "sugira ao seu time", "leve essa pauta para…".
- O nome dos formatos (palestra, imersão, workshop, consultoria, mentoria) aparece como *opção de caminho*, não como oferta.
- Uma frase só por bloco. Nunca repetir o mesmo formato para todas as competências — varia conforme o gap.

## Mapa competência → caminho sugerido

| Competência | Caminho PF (profissional) | Caminho PJ (liderança) |
|---|---|---|
| Estratégia | "Indique uma palestra executiva de IA para alinhar a visão do C-level." | "Uma keynote estratégica acelera o alinhamento de visão antes do roadmap." |
| Processos | "Proponha uma imersão prática para mapear processos com seu time." | "Workshop hands-on de redesenho de processos com IA destrava resultados rápidos." |
| Dados | "Sugira uma consultoria de diagnóstico de dados antes de escalar IA." | "Consultoria estratégica de dados evita stacks caras sem fundação." |
| Ferramentas | "Leve um workshop de ferramentas de IA generativa para sua área." | "Workshop de adoção guiada reduz o custo de teste-e-erro entre times." |
| Pessoas/Skills | "Proponha uma palestra de sensibilização + trilha de capacitação." | "Programa de champions + palestras internas formam multiplicadores." |
| Ética/Compliance | "Indique uma palestra sobre IA responsável para jurídico e liderança." | "Imersão de ética e compliance protege a marca antes do incidente." |
| Segurança | "Sugira um diagnóstico de segurança em uso de IA antes de adoção em massa." | "Consultoria de segurança em IA define guardrails antes do shadow AI explodir." |
| Governança | "Proponha à diretoria uma consultoria para estruturar governança de IA." | "Consultoria de governança formaliza papéis, comitês e políticas de IA." |

Tabela vive no código (`src/lib/teste-ia-pdf.ts`) como constante tipada — fácil de o Jefferson editar depois.

## O que muda no PDF

**Bloco "Plano de Ação 30/60/90"** — para cada uma das 3 competências priorizadas, depois das ações 30/60 e antes da 90 (ou ao final do bloco), uma faixa nova:

```
COMO LEVAR ADIANTE
{frase do mapa acima, escolhida pela finalidade PF/PJ}
```

Estilo visual:
- Faixa fina cinza-grafite (`--secondary`) com letra amarela `COMO LEVAR ADIANTE` (caps, 8pt, bold)
- Texto da sugestão em off-white, 9.5pt, italic, sem nome "Jefferson" (já está assinado no final)
- Altura ~12mm, sem competir com as caixas 30/60/90

**Página final (carta + assinatura)** — manter como está. A assinatura já fecha o relatório pessoalmente; o pitch atual continua válido como recap.

## Detalhes técnicos
- Arquivo único alterado: `src/lib/teste-ia-pdf.ts`
- Nova constante `caminhoPorCompetencia: Record<string, { pf: string; pj: string }>`
- Função helper `pickCaminho(competenciaKey, finalidade)` com fallback genérico
- Renderização inserida dentro do `planoAcao.forEach` existente, reaproveitando `ensureSpace` e a paleta já presente (`252,211,77` amarelo / `30,30,30` grafite)
- Zero mudanças em banco, edge functions ou UI do dashboard
- Sem dependências novas

## Fora do escopo
- Não personaliza por setor/indústria (só por gap + finalidade)
- Não adiciona link/CTA clicável dentro do bloco (mantém o tom de orientação)
- Não toca no dashboard web do teste — só no PDF gerado
