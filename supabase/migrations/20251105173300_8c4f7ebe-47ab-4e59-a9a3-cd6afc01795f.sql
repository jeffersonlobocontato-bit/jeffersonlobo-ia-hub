-- Adicionar campos de imagem nas tabelas existentes
ALTER TABLE public.about_content 
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS read_line text;

ALTER TABLE public.book_content 
ADD COLUMN IF NOT EXISTS cover_image text;

-- Criar tabela para informações de contato
CREATE TABLE IF NOT EXISTS public.contact_info (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  whatsapp text NOT NULL,
  linkedin_url text,
  instagram_url text,
  youtube_url text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Policies para contact_info
CREATE POLICY "Anyone can view contact info" 
ON public.contact_info 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update contact info" 
ON public.contact_info 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Inserir dados padrão de contato se não existir nenhum
INSERT INTO public.contact_info (email, whatsapp, linkedin_url, instagram_url, youtube_url)
SELECT 
  'contato@jeffersonlobo.com',
  '+55 (11) 99999-9999',
  'https://linkedin.com',
  'https://instagram.com',
  'https://youtube.com'
WHERE NOT EXISTS (SELECT 1 FROM public.contact_info);