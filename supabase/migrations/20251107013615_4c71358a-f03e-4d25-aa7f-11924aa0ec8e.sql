-- Remover políticas já que RLS está desabilitado
DROP POLICY IF EXISTS "allow_anon_insert" ON ia_maturity_leads;
DROP POLICY IF EXISTS "allow_anon_update" ON ia_maturity_leads;
DROP POLICY IF EXISTS "allow_admin_select" ON ia_maturity_leads;
DROP POLICY IF EXISTS "allow_anon_insert_chat" ON chat_leads;
DROP POLICY IF EXISTS "allow_anon_update_chat" ON chat_leads;
DROP POLICY IF EXISTS "allow_admin_select_chat" ON chat_leads;