-- Adicionar grants necessários para ia_maturity_leads
GRANT INSERT, UPDATE ON ia_maturity_leads TO anon;
GRANT INSERT, UPDATE ON ia_maturity_leads TO authenticated;
GRANT SELECT ON ia_maturity_leads TO authenticated;

-- Adicionar grants para chat_leads
GRANT INSERT, UPDATE ON chat_leads TO anon;
GRANT INSERT, UPDATE ON chat_leads TO authenticated;
GRANT SELECT ON chat_leads TO authenticated;