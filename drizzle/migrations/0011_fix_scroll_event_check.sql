DROP POLICY IF EXISTS "Anyone can insert valid scroll events" ON public.scroll_events;
CREATE POLICY "Anyone can insert valid scroll events" ON public.scroll_events FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 200 AND length(page_path) BETWEEN 1 AND 500
 AND scroll_depth_percent BETWEEN 0 AND 1000 AND max_scroll_depth BETWEEN 0 AND 10000000);