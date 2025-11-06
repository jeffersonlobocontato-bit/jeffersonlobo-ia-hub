-- Drop e recriar políticas RLS para permitir acesso anônimo

-- Tabela ia_maturity_leads
DROP POLICY IF EXISTS "Anyone can insert leads" ON ia_maturity_leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON ia_maturity_leads;

CREATE POLICY "Anyone can insert leads"
ON ia_maturity_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update leads"
ON ia_maturity_leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Tabela chat_leads
DROP POLICY IF EXISTS "Anyone can insert chat leads" ON chat_leads;
DROP POLICY IF EXISTS "Anyone can update chat leads" ON chat_leads;

CREATE POLICY "Anyone can insert chat leads"
ON chat_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update chat leads"
ON chat_leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);