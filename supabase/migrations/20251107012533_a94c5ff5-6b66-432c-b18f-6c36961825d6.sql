-- Remover políticas existentes
DROP POLICY IF EXISTS "allow_anon_insert" ON ia_maturity_leads;
DROP POLICY IF EXISTS "allow_anon_update" ON ia_maturity_leads;
DROP POLICY IF EXISTS "allow_admin_select" ON ia_maturity_leads;
DROP POLICY IF EXISTS "allow_anon_insert_chat" ON chat_leads;
DROP POLICY IF EXISTS "allow_anon_update_chat" ON chat_leads;
DROP POLICY IF EXISTS "allow_admin_select_chat" ON chat_leads;

-- Criar políticas que se aplicam especificamente aos roles anon e authenticated
CREATE POLICY "allow_anon_insert"
ON ia_maturity_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "allow_anon_update"
ON ia_maturity_leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_admin_select"
ON ia_maturity_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat leads
CREATE POLICY "allow_anon_insert_chat"
ON chat_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "allow_anon_update_chat"
ON chat_leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_admin_select_chat"
ON chat_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));