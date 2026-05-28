O problema agora está claro: o link `https://jeffersonlobo.tech/noticia/...` está retornando o `index.html` genérico da SPA publicada, não o HTML estático da notícia. Por isso o WhatsApp usa a imagem e o título do site. O arquivo estático existe no projeto, mas a hospedagem não está servindo esse arquivo nessa rota.

Plano de correção:

1. Remover a dependência da rota estática `/noticia/[slug]/index.html`, porque ela está sendo engolida pelo fallback da SPA na publicação atual.
2. Usar o endpoint `blog-share` como fonte única do preview social, mas corrigido para ficar profissional:
   - `og:title` = título real da notícia
   - `og:description` = resumo real da notícia
   - `og:image` = capa real da notícia em 1200x630
   - `og:url` = URL amigável publicada, não domínio técnico
   - HTML simples com link de fallback para humanos
   - headers corretos: `Content-Type: text/html; charset=utf-8`
3. Alterar o botão de WhatsApp para compartilhar diretamente a URL do endpoint `blog-share`, porque é a única URL que sabemos que crawlers estão conseguindo acessar agora.
4. Evitar que a mensagem escrita no WhatsApp force o preview genérico: compartilhar só a URL, como sites de notícia fazem.
5. Validar com uma requisição simulando crawler do WhatsApp e confirmar no HTML bruto que aparecem `og:title` e `og:image` da notícia, antes de concluir.

Observação importante: o visual final no WhatsApp depende do cache do próprio WhatsApp. Como a URL técnica antiga já apareceu correta parcialmente e a URL `/noticia` já cacheou errado, a correção mais segura é usar uma URL nova ou acrescentar um parâmetro de versão no compartilhamento, por exemplo `&v=2`, para forçar novo scrape.