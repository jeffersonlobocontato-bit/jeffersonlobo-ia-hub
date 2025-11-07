-- Reativar RLS com políticas corretas
ALTER TABLE ia_maturity_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_leads ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Anyone can insert leads" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Admins can view leads" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Anyone can insert chat leads" ON chat_leads;
DROP POLICY IF EXISTS "Anyone can update chat leads" ON chat_leads;
DROP POLICY IF EXISTS "Admins can view chat leads" ON chat_leads;

-- Criar políticas mais permissivas (sem restrição de autenticação)
CREATE POLICY "Enable insert for all users"
ON ia_maturity_leads
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON ia_maturity_leads
FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable read for admins only"
ON ia_maturity_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat leads
CREATE POLICY "Enable insert for all users chat"
ON chat_leads
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for all users chat"
ON chat_leads
FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable read for admins only chat"
ON chat_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));