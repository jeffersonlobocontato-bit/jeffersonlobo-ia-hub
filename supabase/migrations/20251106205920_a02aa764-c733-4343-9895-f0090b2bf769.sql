-- Remover todas as políticas RLS existentes e recriar de forma mais simples
DROP POLICY IF EXISTS "Admins can view all leads" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON ia_maturity_leads;

-- Criar políticas mais permissivas para teste
CREATE POLICY "Enable insert for all users"
ON ia_maturity_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON ia_maturity_leads
FOR UPDATE
USING (true);

CREATE POLICY "Enable select for admins"
ON ia_maturity_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fazer o mesmo para chat_leads
DROP POLICY IF EXISTS "Admins can view all chat leads" ON chat_leads;
DROP POLICY IF EXISTS "Anyone can insert chat leads" ON chat_leads;
DROP POLICY IF EXISTS "Anyone can update chat leads" ON chat_leads;

CREATE POLICY "Enable insert for all users"
ON chat_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON chat_leads
FOR UPDATE
USING (true);

CREATE POLICY "Enable select for admins"
ON chat_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));