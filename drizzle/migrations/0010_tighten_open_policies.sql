DROP POLICY IF EXISTS "Anyone can insert CTA events" ON public.cta_events;
CREATE POLICY "Anyone can insert valid CTA events" ON public.cta_events FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 200 AND length(cta_name) BETWEEN 1 AND 200 AND length(cta_location) BETWEEN 1 AND 200 AND length(page_path) BETWEEN 1 AND 500);

DROP POLICY IF EXISTS "Anyone can insert click events" ON public.click_events;
CREATE POLICY "Anyone can insert valid click events" ON public.click_events FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 200 AND length(page_path) BETWEEN 1 AND 500
 AND coalesce(length(element_id),0) <= 300 AND coalesce(length(element_class),0) <= 1000 AND coalesce(length(element_text),0) <= 1000
 AND x_position BETWEEN -10000 AND 100000 AND y_position BETWEEN -10000 AND 1000000
 AND viewport_width BETWEEN 0 AND 20000 AND viewport_height BETWEEN 0 AND 20000);

DROP POLICY IF EXISTS "Anyone can insert scroll events" ON public.scroll_events;
CREATE POLICY "Anyone can insert valid scroll events" ON public.scroll_events FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 200 AND length(page_path) BETWEEN 1 AND 500
 AND scroll_depth_percent BETWEEN 0 AND 100 AND max_scroll_depth BETWEEN 0 AND 100);

DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.site_analytics;
CREATE POLICY "Anyone can insert valid analytics" ON public.site_analytics FOR INSERT TO anon, authenticated
WITH CHECK (length(session_id) BETWEEN 1 AND 200 AND length(page_path) BETWEEN 1 AND 500
 AND coalesce(length(page_title),0) <= 500 AND coalesce(length(referrer),0) <= 2000 AND coalesce(length(user_agent),0) <= 1000
 AND coalesce(duration_seconds,0) BETWEEN 0 AND 86400);

DROP POLICY IF EXISTS "Anyone can view knowledge base" ON public.knowledge_base;
CREATE POLICY "Admins can view knowledge base" ON public.knowledge_base FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can view questions" ON public.ia_maturity_questions;
CREATE POLICY "Anyone can view valid questions" ON public.ia_maturity_questions FOR SELECT TO anon, authenticated
USING (finalidade IN ('PF','PJ'));