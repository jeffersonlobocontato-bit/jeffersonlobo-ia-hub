-- Remover políticas existentes e recriar de forma mais permissiva
DROP POLICY IF EXISTS "ia_maturity_leads_insert_policy" ON ia_maturity_leads;
DROP POLICY IF EXISTS "ia_maturity_leads_update_policy" ON ia_maturity_leads;
DROP POLICY IF EXISTS "ia_maturity_leads_select_policy" ON ia_maturity_leads;

DROP POLICY IF EXISTS "chat_leads_insert_policy" ON chat_leads;
DROP POLICY IF EXISTS "chat_leads_update_policy" ON chat_leads;
DROP POLICY IF EXISTS "chat_leads_select_policy" ON chat_leads;

-- Políticas para ia_maturity_leads - PERMISSIVE (sem TO, permitindo todos os roles)
CREATE POLICY "Anyone can insert leads"
ON ia_maturity_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update leads"
ON ia_maturity_leads
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view leads"
ON ia_maturity_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para chat_leads
CREATE POLICY "Anyone can insert chat leads"
ON chat_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update chat leads"
ON chat_leads
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view chat leads"
ON chat_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));