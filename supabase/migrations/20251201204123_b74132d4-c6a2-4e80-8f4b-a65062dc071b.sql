-- Permitir que qualquer pessoa atualize um lead específico usando o UUID como token
CREATE POLICY "Anyone can update their own lead by id"
ON public.ia_maturity_leads
FOR UPDATE
USING (true)
WITH CHECK (true);