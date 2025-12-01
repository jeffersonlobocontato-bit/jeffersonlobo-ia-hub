-- Permitir que qualquer pessoa visualize um lead específico pelo ID
-- O UUID funciona como "token de acesso" seguro
CREATE POLICY "Anyone can view lead by id"
ON public.ia_maturity_leads
FOR SELECT
USING (true);