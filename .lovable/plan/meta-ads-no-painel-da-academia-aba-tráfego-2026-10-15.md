# Meta Ads no painel da Academia (aba Tráfego)

## 1) Diagnóstico (como está hoje)
- **Tabela "Campanhas (utm_campaign)"**: vem da função `painel_academia(p_de, p_ate)` (versão atual na migração `20261014000000_painel_sem_robos.sql`), campo `campanhas` do JSON. Cada linha junta nomes de campanha vindos de visitas, leads, vendas e investimento manual:
  - `sessoes` (visitas): `site_analytics.utm_campaign`, primeira visita da sessão, já sem robôs e sem sessões de admin.
  - `leads`: `academia_leads.origem->>'utm_campaign'`.
  - `vendas` / `receita`: `curso_pedidos` com `status = 'aprovado'`, receita = `coalesce(valor_pago, valor)`, campanha em `origem->>'utm_campaign'`.
  - `investimento`: soma de `academia_investimentos.valor` onde `campanha` = utm_campaign.
  - ROAS é calculado na tela (`AbaTrafego.tsx`): receita ÷ investimento.
- **Aba Investimento**: grava direto na tabela `academia_investimentos` (data, canal, campanha em minúsculas, valor, observação), só admin pela regra de acesso.
- **Rotinas agendadas**: não há rotina horária ativa para funções; o padrão antigo do projeto (comentado) usa agendamento do banco chamando a função com uma chave guardada no cofre. Segredos de API ficam nos segredos do backend (ex.: `GITHUB_TOKEN`, `OPENAI_API_KEY`). `WINDSOR_API_KEY` ainda não existe.
- **Pedidos de teste**: não existe coluna `is_test` em `curso_pedidos` (os testes em aberto foram apagados). Proposta: criar `is_test boolean default false` e excluir da contagem.

## 2) Tabela `ads_metrics_daily`
| Coluna | Tipo |
|---|---|
| date | date not null |
| ad_id | text not null |
| ad_name | text |
| campaign_id | text |
| adset_id | text |
| spend | numeric(12,2) default 0 |
| impressions | integer default 0 |
| reach | integer default 0 |
| video_views | integer default 0 (3 s) |
| thruplays | integer default 0 |
| link_clicks | integer default 0 |
| landing_page_views | integer default 0 |
| synced_at | timestamptz default now() |

Chave única (date, ad_id). Leitura só admin; escrita só pela função (nenhuma regra de escrita para usuários).

## 3) Tabela `ads_utm_map`
| Coluna | Tipo |
|---|---|
| ad_id | text primary key |
| utm_campaign | text (nulo = "sem campanha") |
| label | text |
| active | boolean default true |

Leitura e edição só admin. Linhas iniciais (todas `lote1`):
- 52594450712705 — "Quem não tem equipe para editar…" — inativo
- 52594762006905 — "Se você usa IA para fazer…" — ativo
- 52594763952505 — "Quem não tem equipe para…" — ativo

A sincronização cria automaticamente linha com `utm_campaign` nulo para anúncios novos; no painel aparecem como "sem campanha" com seletor.

## 4) Tabela `ads_sync_status` (1 linha)
`last_run_at`, `last_ok_at`, `last_error`, `rows_upserted` — para mostrar "última atualização" e o erro.

## 5) Função `sync-meta-ads`
- Chama Windsor.ai (`connectors/facebook`, conta 261384327316929, últimos 7 dias, campos pedidos), formato conferido na documentação antes de escrever.
- Upsert por (date, ad_id); grava status/erro.
- Aceita chamada do agendamento horário ou de admin logado (botão "Atualizar agora").
- Chave só em `WINDSOR_API_KEY` (você cadastra).

## 6) `painel_academia` e aba Tráfego
- Em `campanhas`, adicionar: impressões, visualizações do vídeo, thruplays, cliques no link, gasto Meta (somando anúncios ligados, inclusive inativos).
- Investimento = gasto Meta quando houver, senão o manual. ROAS e CPA na tela.
- Nova lista `anuncios` (por anúncio, com alcance, selo ativo/pausado, campanha ligada).
- Vendas/receita ignoram `is_test = true`.
- Tela: colunas Impressões | Visualizações | Cliques | Visitas | CTR | Clique→visita | CPC | Custo/visita | Investimento | Vendas | CPA | ROAS; lista por anúncio abaixo; bloco "sem campanha" com seletor; botão "Atualizar agora" e "última atualização".

## Não muda
Pixel, `<head>`, JSON-LD.
