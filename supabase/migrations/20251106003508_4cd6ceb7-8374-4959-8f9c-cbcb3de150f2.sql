-- Drop existing SELECT policies that might be misconfigured
DROP POLICY IF EXISTS "Anyone can view hero content" ON hero_content;
DROP POLICY IF EXISTS "Anyone can view about content" ON about_content;
DROP POLICY IF EXISTS "Anyone can view book content" ON book_content;
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Anyone can view active blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can view book features" ON book_features;

-- Recreate SELECT policies with explicit FOR SELECT and TO public
CREATE POLICY "Anyone can view hero content"
ON hero_content
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can view about content"
ON about_content
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can view book content"
ON book_content
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can view services"
ON services
FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Anyone can view active blog posts"
ON blog_posts
FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Anyone can view book features"
ON book_features
FOR SELECT
TO public
USING (active = true);