Plano para resolver sem consumir créditos de geração:

1. **Corrigir a URL canônica do preview social**
   - Hoje a função `blog-share` devolve `og:title` correto, mas ainda coloca `og:url` como `https://jeffersonlobo.tech/share/blog/...`.
   - Esse caminho do domínio próprio não está funcionando e pode fazer WhatsApp/LinkedIn voltarem para o HTML genérico do site.
   - Vou trocar `og:url` e `twitter:url` para a própria URL real que está sendo compartilhada: a URL direta da função `blog-share?slug=...`.

2. **Forçar HTML real para crawlers**
   - No teste direto, a função respondeu com o título correto, mas o cabeçalho veio como `Content-Type: text/plain`.
   - Vou ajustar os headers para `Content-Type: text/html; charset=utf-8`, usando a capitalização padrão, para WhatsApp interpretar a resposta como página HTML com metatags.

3. **Deixar o texto enviado no WhatsApp mais limpo**
   - Manter o compartilhamento como: `Título — URL`.
   - O preview deverá mostrar o título pelo `og:title`; o texto digitado na mensagem também começa com o título.

4. **Validar sem gastar créditos**
   - Vou testar a função diretamente com user-agent de crawler e conferir se a resposta contém:
     - `Content-Type: text/html`
     - `og:title` com o título do artigo
     - `og:image` com a capa
     - `og:url` apontando para a URL direta funcional

Sobre devolução de créditos: eu não consigo processar reembolso por aqui. A parte de cobrança/créditos precisa ser tratada pelo suporte da plataforma, mas vou fazer a correção técnica sem usar geração de imagem/IA.