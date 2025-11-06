-- Reabilitar RLS e criar políticas simplificadas
ALTER TABLE ia_maturity_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_leads ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable update for anon and authenticated" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Enable select for admins" ON ia_maturity_leads;

DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON chat_leads;
DROP POLICY IF EXISTS "Enable update for anon and authenticated" ON chat_leads;
DROP POLICY IF EXISTS "Enable select for admins" ON chat_leads;

-- Criar políticas simples que permitem tudo para usuários públicos
CREATE POLICY "Allow all inserts"
ON ia_maturity_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all updates"
ON ia_maturity_leads
FOR UPDATE
USING (true);

CREATE POLICY "Allow admins to select"
ON ia_maturity_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat leads
CREATE POLICY "Allow all inserts"
ON chat_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all updates"
ON chat_leads
FOR UPDATE
USING (true);

CREATE POLICY "Allow admins to select"
ON chat_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));