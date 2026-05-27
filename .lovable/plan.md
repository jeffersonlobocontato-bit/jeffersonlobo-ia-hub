# Auditoria + plano de melhoria — foco: vender palestras e consultorias

Objetivo de negócio: **gerar reuniões qualificadas com decisores (RH, marketing, C-level, organizadores de eventos) para palestras e consultorias em IA.**

Veredito: estrutura sólida e identidade visual forte, mas o site hoje vende **o Teste de IA** — não vende **você como speaker/consultor**. O Teste é ótima isca, mas o funil termina solto. Plano abaixo cobre 5 fases priorizadas por ROI comercial.

---

## O que mantemos

- Identidade brutalista, Teste de Maturidade como lead magnet, CMS/Admin, analytics próprio e SEO básico.

## Problemas críticos identificados

1. **Oferta comercial invisível**: não há seção dedicada a Palestras nem a Consultoria. Não há formatos, vídeo de palco, logos de quem contratou (Gazeta do Povo, MIT, imersão internacional ainda não viraram prova visual).
2. **CTAs não convertem para o objetivo**: hero, sticky e secundário levam todos ao Teste. Decisor que vem por indicação não tem caminho de 1 clique para "Contratar palestra".
3. **ContactSection genérica**: só um botão de WhatsApp. Sem briefing, sem qualificação, sem registro no banco.
4. **Prova social fraca**: 1 depoimento textual, sem logos, sem fotos de palco, sem vídeos.
5. **Headline inspiracional demais**: não diz o que você entrega para quem quer contratar.
6. **Ordem do Index mata conversão**: Livro/Podcast/Blog vêm antes do Contato e empurram o decisor para fora.
7. **Higiene**: banner de Debug Auth no Header, footer com link "livro" mas sem "palestras", fallbacks de stats inventados.

---

## Plano aprovado — execução nesta ordem

### Fase 1 · Tornar a oferta comercial visível
- Criar `PalestrasSection` com 3 formatos (Keynote, Workshop/Imersão, Consultoria estratégica) — cada card: público-alvo, duração, entregáveis, CTA "Quero conversar".
- `LogosBarSection` separada com logos (Gazeta do Povo, MIT, imersão internacional, clientes).
- Hero: trocar CTA secundário "Ver meu método" por **"Contratar palestra"** → scroll para PalestrasSection.
- StickyHeaderCTA: passar a alternar — "Diagnóstico" no topo, "Solicitar proposta" depois da seção Sobre.

### Fase 2 · Qualificar leads de palestra
- Refazer `ContactSection` como **formulário de briefing**: nome, empresa, cargo, e-mail, WhatsApp, tipo (palestra/workshop/consultoria/imersão), data, formato, público, cidade, mensagem.
- Nova tabela `briefing_requests` (RLS: admin lê tudo, anon insere). GRANTs corretos.
- Edge function `send-briefing-email` (Lovable Emails) que notifica você no recebimento.
- Tela de sucesso oferecendo o Teste IA enquanto aguarda retorno.
- Botão WhatsApp continua como alternativa.

### Fase 3 · Prova social que vende palestra
- Reformular `TrustBarSection`: faixa de logos + grid de fotos de palco + carrossel de depoimentos com foto/cargo/empresa.
- Nova tabela `stage_photos` (CMS) + nova tab `AdminStagePhotosTab`.
- Nova tabela `speaking_logos` + nova tab `AdminLogosTab`.
- Estender `testimonials` com campos `author_photo`, `author_company`, `event_name`.

### Fase 4 · Reordenar e enxugar o Index
- Nova ordem: Hero → Teste IA → LogosBar → **Palestras** → Sobre → Prova social (palco + depoimentos) → **Briefing** → Livro → Podcast → Blog → Footer.
- Atualizar Header e Footer com links "Palestras" e "Contratar".

### Fase 5 · Polimento, autoridade e SEO
- Editar copy/headline do Hero via `hero_content` para versão mais comercial (mantendo opção de A/B).
- Suporte a vídeo de palco no Hero (campo `hero_video_url` em `hero_content`); fallback para imagem atual.
- JSON-LD `Person` + `Service` em `index.html` (SEO local "palestrante IA Brasil").
- Remover banner Debug Auth do Header.
- Criar página dedicada `/palestras` (deep-dive + briefing próprio) — facilita compartilhar link em propostas.
- Tab `AdminBriefingsTab` para gerenciar leads de briefing (visualizar, marcar status, exportar).

---

## Mudanças técnicas resumidas

```text
DB:
  + briefing_requests (id, nome, empresa, cargo, email, whatsapp,
                       tipo, data_evento, formato, publico, cidade,
                       mensagem, status, created_at)
  + speaking_logos (id, name, logo_url, link, display_order, active)
  + stage_photos (id, image_url, caption, event_name, display_order, active)
  ~ testimonials (+ author_photo, author_company, event_name)
  ~ hero_content (+ hero_video_url, cta_tertiary, cta_tertiary_target)

Edge functions:
  + send-briefing-email (Lovable Emails)

Frontend:
  + src/components/PalestrasSection.tsx
  + src/components/LogosBarSection.tsx
  + src/components/StagePhotosSection.tsx
  + src/components/BriefingForm.tsx  (substitui núcleo do ContactSection)
  + src/pages/Palestras.tsx
  + src/components/admin/AdminPalestrasTab.tsx
  + src/components/admin/AdminBriefingsTab.tsx
  + src/components/admin/AdminLogosTab.tsx
  + src/components/admin/AdminStagePhotosTab.tsx
  ~ HeroSection (novo CTA + suporte a vídeo)
  ~ Index (nova ordem)
  ~ Header/Footer (novos links)
  ~ StickyHeaderCTA (CTA dinâmico)
  ~ TestimonialsCarousel novo dentro de TrustBarSection
  ~ index.html (JSON-LD)
  - Debug Auth banner

SEO/conteúdo:
  Tokens brutalistas mantidos, nenhuma cor hardcoded.
  Validação com zod no formulário de briefing.
```

---

## O que NÃO está no escopo

- Reescrita do Teste de IA (já refinado nas últimas iterações).
- Internacionalização.
- Pagamento online de palestras (continua via proposta humana).
- Integração com CRM externo (pode entrar em fase futura via Resend/HubSpot connector).

---

## Execução

Vou rodar as fases em sequência, parando para você revisar entre cada fase. Começo pela **Fase 1 (oferta visível)** porque é a que mais move conversão imediata.
