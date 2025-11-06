-- Corrigir as políticas RLS para especificar os roles corretos do Supabase
DROP POLICY IF EXISTS "Enable insert for all users" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable update for all users" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable select for admins" ON ia_maturity_leads;

-- Políticas para ia_maturity_leads com roles específicos
CREATE POLICY "Enable insert for anon and authenticated"
ON ia_maturity_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for anon and authenticated"
ON ia_maturity_leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable select for admins"
ON ia_maturity_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Corrigir chat_leads também
DROP POLICY IF EXISTS "Enable insert for all users" ON chat_leads;
DROP POLICY IF EXISTS "Enable update for all users" ON chat_leads;
DROP POLICY IF EXISTS "Enable select for admins" ON chat_leads;

CREATE POLICY "Enable insert for anon and authenticated"
ON chat_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for anon and authenticated"
ON chat_leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable select for admins"
ON chat_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));