-- Troca o gatilho automático de "prévia de compartilhamento" pra usar a mesma
-- lógica já testada e funcionando na pipeline de conteúdo (publishNoticiaHtml,
-- via a nova function publish-share-page), em vez de disparar rebuild no
-- GitHub Actions.
--
-- Por quê: o mecanismo anterior (supabase/migrations/20260913140000_auto_rebuild_on_publish.sql)
-- chamava repository_dispatch pra acordar o workflow .github/workflows/trigger-rebuild.yml.
-- Em mais de uma semana, esse workflow nunca teve uma execução confirmada —
-- o trigger no banco nunca funcionou de ponta a ponta. Enquanto isso, a
-- pipeline de conteúdo (construída depois) resolveu o mesmo problema de
-- outro jeito — commitando public/noticia/{slug}.html direto via GitHub
-- Contents API — e isso SIM está confirmado funcionando (2 posts em 21/09).
-- Esta migration generaliza esse caminho já comprovado pra qualquer post,
-- não só os da pipeline: cobre também posts publicados direto via SQL.
--
-- Reaproveita o secret que já existe no Vault pro processamento da fila de
-- e-mail (é só a service_role key do projeto, não é específico de e-mail) —
-- não precisa de nenhum secret novo. O GITHUB_TOKEN que a function
-- publish-share-page usa por baixo dos panos já está configurado nos
-- secrets do projeto (mesmo usado pela pipeline hoje).

create or replace function public.notify_blog_post_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'email_queue_service_role_key'
  limit 1;

  if v_key is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://cgydeldzhnfyexphaheq.supabase.co/functions/v1/publish-share-page',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('postId', new.id)
  );

  return new;
end;
$$;

-- O trigger trg_notify_blog_post_published (criado em 20260913140000) não
-- precisa ser recriado — ele chama esta function pelo nome, então já passa
-- a usar o novo comportamento automaticamente.
