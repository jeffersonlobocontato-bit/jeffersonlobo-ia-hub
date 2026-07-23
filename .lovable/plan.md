## Diagnóstico

O DNS está correto, mas o site continua fora do ar por um motivo diferente do que parecia:

- `jeffersonlobo.tech` → `185.158.133.1` ✅
- `www.jeffersonlobo.tech` → `185.158.133.1` ✅
- TXT `brevo-code` presente ✅
- App Lovable (`jeffersonlobo-ia-hub.lovable.app`) responde **200 OK** ✅

Porém:

- `https://jeffersonlobo.tech` responde **HTTP 421 Misdirected Request** (servido pelo Cloudflare da Lovable)
- `https://www.jeffersonlobo.tech` falha no **handshake TLS** (sem certificado emitido)

**Causa:** o domínio `jeffersonlobo.tech` **não está mais vinculado a este projeto na Lovable**. O 421 é a resposta padrão do edge quando o DNS aponta para o IP da Lovable mas o domínio não consta na lista de domínios do projeto — por isso o certificado do `www` também não é emitido. Provavelmente o domínio foi removido/desconectado em algum momento (ou nunca foi reconectado após alguma alteração), enquanto o DNS na IONOS continuou apontando para cá.

Isto não é um problema de DNS nem de código — é de configuração do projeto.

## O que fazer (você, na Lovable)

1. Abrir **Project Settings → Project → Domains**
2. Clicar em **Connect Domain** e adicionar `jeffersonlobo.tech`
3. Repetir e adicionar também `www.jeffersonlobo.tech`
4. Marcar `jeffersonlobo.tech` como **Primary** (o `www` vai redirecionar para ele)
5. Como o DNS já está correto, a verificação deve passar em minutos e o SSL é provisionado automaticamente

<presentation-actions>
<presentation-open-publish>Abrir Publish / Domínios</presentation-open-publish>
</presentation-actions>

## Depois que reconectar

Eu valido:
- Status `Active` nos dois domínios
- `https://jeffersonlobo.tech` retornando 200
- `https://www.jeffersonlobo.tech` com SSL válido redirecionando para o primary

## Observações

- **Não mexer no DNS da IONOS** — está tudo certo lá. Qualquer mudança agora só atrasa.
- **Não mexer na delegação `notify.jeffersonlobo.tech`** (email transacional Lovable) — continua isolada e funcionando.
- Se ao tentar conectar aparecer "domínio já vinculado a outro projeto", me avise: nesse caso é preciso removê-lo do projeto antigo antes.
