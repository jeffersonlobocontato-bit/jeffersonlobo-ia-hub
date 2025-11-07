-- Garantir que os roles anon e authenticated tenham permissões básicas
GRANT SELECT, INSERT, UPDATE ON ia_maturity_leads TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_leads TO anon, authenticated;

-- Garantir permissões de uso nas sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;