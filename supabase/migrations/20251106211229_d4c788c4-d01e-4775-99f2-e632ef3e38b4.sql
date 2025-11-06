-- Remover todas as políticas e recriar com configuração explícita
DROP POLICY IF EXISTS "Allow all inserts" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Allow all updates" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Allow admins to select" ON ia_maturity_leads;

DROP POLICY IF EXISTS "Allow all inserts" ON chat_leads;
DROP POLICY IF EXISTS "Allow all updates" ON chat_leads;
DROP POLICY IF EXISTS "Allow admins to select" ON chat_leads;

-- Políticas para ia_maturity_leads com especificação explícita de anon
CREATE POLICY "ia_maturity_leads_insert_policy"
ON ia_maturity_leads
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

CREATE POLICY "ia_maturity_leads_update_policy"
ON ia_maturity_leads
FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "ia_maturity_leads_select_policy"
ON ia_maturity_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para chat_leads
CREATE POLICY "chat_leads_insert_policy"
ON chat_leads
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

CREATE POLICY "chat_leads_update_policy"
ON chat_leads
FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "chat_leads_select_policy"
ON chat_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));