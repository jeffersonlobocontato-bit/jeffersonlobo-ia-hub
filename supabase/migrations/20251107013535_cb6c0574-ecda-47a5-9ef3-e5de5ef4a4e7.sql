-- Desabilitar RLS nas tabelas de leads públicos
-- Estas tabelas precisam aceitar submissões anônimas
ALTER TABLE ia_maturity_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_leads DISABLE ROW LEVEL SECURITY;