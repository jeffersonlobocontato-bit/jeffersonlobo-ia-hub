-- Dispara automaticamente um rebuild (via GitHub repository_dispatch) sempre
-- que um post é inserido/atualizado em blog_posts com status = 'published'.
-- Elimina a necessidade de um commit vazio manual toda vez que um post é
-- publicado direto no banco (fora do fluxo normal de build).
--
-- Pré-requisito (rodar manualmente, uma única vez, ANTES desta migração):
--   select vault.create_secret('<github fine-grained PAT, contents:write>', 'github_pat_blog_rebuild');
-- O token nunca deve ser commitado neste arquivo nem enviado por chat.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_blog_post_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where name = 'github_pat_blog_rebuild'
  limit 1;

  if v_token is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.github.com/repos/jeffersonlobocontato-bit/jeffersonlobo-ia-hub/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_token,
      'Accept', 'application/vnd.github+json',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('event_type', 'blog-post-published')
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_blog_post_published on public.blog_posts;

create trigger trg_notify_blog_post_published
after insert or update on public.blog_posts
for each row
when (new.status = 'published' and new.active = true)
execute function public.notify_blog_post_published();
