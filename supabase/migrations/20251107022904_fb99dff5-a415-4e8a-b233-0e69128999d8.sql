-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge base table for RAG
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fonte TEXT NOT NULL,
  categoria TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX knowledge_base_embedding_idx ON public.knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for category filtering
CREATE INDEX knowledge_base_categoria_idx ON public.knowledge_base(categoria);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Anyone can read knowledge base
CREATE POLICY "Anyone can view knowledge base" 
ON public.knowledge_base 
FOR SELECT 
USING (true);

-- Only admins can manage knowledge base
CREATE POLICY "Admins can manage knowledge base" 
ON public.knowledge_base 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  titulo text,
  conteudo text,
  fonte text,
  categoria text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.titulo,
    knowledge_base.conteudo,
    knowledge_base.fonte,
    knowledge_base.categoria,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();