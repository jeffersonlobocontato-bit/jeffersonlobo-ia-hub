-- Remover todas as políticas e criar apenas UMA política permissiva para INSERT
DROP POLICY IF EXISTS "Enable insert for all users" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable update for all users" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable read for admins only" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable insert for all users chat" ON chat_leads;
DROP POLICY IF EXISTS "Enable update for all users chat" ON chat_leads;
DROP POLICY IF EXISTS "Enable read for admins only chat" ON chat_leads;

-- Política simples sem restrição de role para INSERT (qualquer um pode inserir)
CREATE POLICY "allow_anon_insert"
ON ia_maturity_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "allow_anon_update"  
ON ia_maturity_leads
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_admin_select"
ON ia_maturity_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat leads
CREATE POLICY "allow_anon_insert_chat"
ON chat_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "allow_anon_update_chat"
ON chat_leads
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_admin_select_chat"
ON chat_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));