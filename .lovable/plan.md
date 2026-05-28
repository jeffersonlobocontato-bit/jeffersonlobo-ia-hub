# Resolver pendências de SEO

Duas pendências restam da auditoria:

## 1. Google Search Console (indexação)

Conectar o GSC para validar o domínio `jeffersonlobo.tech`, submeter o sitemap e habilitar dados de busca.

Passos:
- Disparar `standard_connectors--connect` com `google_search_console` — você autoriza o OAuth pelo modal
- Após conectar: gerar token META de verificação, injetar a tag `<meta name="google-site-verification" ...>` no `index.html`, chamar verify e adicionar o site `https://jeffersonlobo.tech/` no GSC
- Submeter `https://jeffersonlobo.tech/sitemap.xml`

## 2. Contraste (Lighthouse, acessibilidade)

O scanner achou texto com contraste abaixo de 4.5:1 na versão publicada. Os suspeitos no design brutalist são:

- `text-[10px] font-bold uppercase text-muted-foreground` no subtítulo do logo (Header.tsx) — texto muito pequeno com cor muted
- Possíveis usos de `text-muted-foreground` sobre fundos com baixo contraste em CTAs e cards

Plano:
- Auditar componentes de alto tráfego (Header, Hero, Footer, BlogSection, ContactSection, TrustBarSection) procurando `text-muted-foreground`, `opacity-*`, e cores arbitrárias (`text-gray-*`) sobre fundos claros/escuros
- Trocar por `text-foreground` ou aumentar peso/tamanho onde aplicável, mantendo a identidade brutalista (preto/amarelo/laranja)
- Especificamente: subtítulo do logo passa de `text-muted-foreground` para `text-foreground/80` e tamanho `text-[11px]`

## Após implementar

Publicar o app (o aviso de contraste vem da versão publicada) e rodar nova auditoria para confirmar.

---

**Confirme antes de prosseguir:**
- Posso disparar o modal de conexão do Google Search Console agora?
- Posso ajustar o contraste do subtítulo do logo + revisar usos de `text-muted-foreground` em componentes de marketing?