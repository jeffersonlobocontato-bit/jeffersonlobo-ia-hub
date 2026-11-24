CREATE TABLE IF NOT EXISTS public.podcast_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.podcast_series TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcast_series TO authenticated;
GRANT ALL ON public.podcast_series TO service_role;
ALTER TABLE public.podcast_series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view podcast series" ON public.podcast_series;
CREATE POLICY "Anyone can view podcast series" ON public.podcast_series FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage podcast series" ON public.podcast_series;
CREATE POLICY "Admins can manage podcast series" ON public.podcast_series FOR ALL
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS update_podcast_series_updated_at ON public.podcast_series;
CREATE TRIGGER update_podcast_series_updated_at BEFORE UPDATE ON public.podcast_series
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.podcast_episodes
  ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.podcast_series(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_series ON public.podcast_episodes(series_id, episode_number);
INSERT INTO public.podcast_series (title, slug, description, position)
VALUES ('Prova de Ganho','prova-de-ganho','Como decidir, medir e governar projetos de IA com número: da linha de base às decisões que nunca ficam só com a máquina.',1)
ON CONFLICT (slug) DO NOTHING;
UPDATE public.podcast_episodes e SET series_id = s.id, episode_number = v.n
FROM public.podcast_series s,
 (VALUES ('codigo-lobo-ep01-P00',1),('codigo-lobo-ep02-L1',2),('codigo-lobo-ep03-L2',3),('codigo-lobo-ep04-L4',4),('codigo-lobo-ep05-P01',5),('codigo-lobo-ep06-P05',6),('codigo-lobo-ep07-N4',7),('codigo-lobo-ep08-L5',8),('codigo-lobo-ep09-L7',9)) AS v(guid,n)
WHERE s.slug='prova-de-ganho' AND e.guid=v.guid;