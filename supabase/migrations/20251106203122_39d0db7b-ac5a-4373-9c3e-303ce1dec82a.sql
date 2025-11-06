-- Tabela para armazenar leads capturados pelo chat
CREATE TABLE public.chat_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  apelido TEXT,
  whatsapp TEXT NOT NULL,
  mensagens JSONB DEFAULT '[]'::jsonb,
  interesses TEXT[] DEFAULT ARRAY[]::text[],
  primeira_interacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ultima_interacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver todos os leads
CREATE POLICY "Admins can view all chat leads"
ON public.chat_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Política: Qualquer um pode inserir (será feito pela edge function)
CREATE POLICY "Anyone can insert chat leads"
ON public.chat_leads
FOR INSERT
WITH CHECK (true);

-- Política: Qualquer um pode atualizar (será feito pela edge function para adicionar mensagens)
CREATE POLICY "Anyone can update chat leads"
ON public.chat_leads
FOR UPDATE
USING (true);

-- Índices para performance
CREATE INDEX idx_chat_leads_whatsapp ON public.chat_leads(whatsapp);
CREATE INDEX idx_chat_leads_created_at ON public.chat_leads(created_at DESC);

-- Trigger para atualizar ultima_interacao
CREATE OR REPLACE FUNCTION public.update_chat_lead_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_interacao = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_chat_leads_ultima_interacao
BEFORE UPDATE ON public.chat_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_lead_last_interaction();
