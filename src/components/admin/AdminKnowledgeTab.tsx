import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Database, RefreshCw } from "lucide-react";

export const AdminKnowledgeTab = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ count: number } | null>(null);

  const loadStats = async () => {
    try {
      const { count, error } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setStats({ count: count || 0 });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const populateKnowledge = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-knowledge');
      
      if (error) throw error;
      
      toast.success(data.message || 'Base de conhecimento atualizada!');
      await loadStats();
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao popular base');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Base de Conhecimento RAG</h2>
        <p className="text-muted-foreground">
          Gerencie a base de conhecimento do chatbot. O sistema usa RAG (Retrieval Augmented Generation) 
          para buscar informações relevantes antes de responder.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Estatísticas
          </CardTitle>
          <CardDescription>
            Status atual da base de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={loadStats} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Estatísticas
            </Button>
            
            {stats && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total de chunks na base:</p>
                <p className="text-3xl font-bold">{stats.count}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Base de Conhecimento</CardTitle>
          <CardDescription>
            Processa e indexa todos os documentos de conhecimento do Jefferson Lobo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2">Conteúdo incluído:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Método DEL (Decomposição de Estrutura de Linguagem)</li>
                <li>Guia completo de IA para projetos</li>
                <li>Playbook de implementação em empresas</li>
                <li>Roteiro de aprendizado em IA</li>
                <li>Templates e modelos prontos</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm">
                ⚠️ <strong>Atenção:</strong> Este processo irá limpar e recriar toda a base de conhecimento.
                Pode levar alguns minutos para processar todos os documentos.
              </p>
            </div>

            <Button 
              onClick={populateKnowledge} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Popular Base de Conhecimento
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona o RAG</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <ol>
            <li><strong>Pergunta do usuário</strong>: O chatbot recebe uma pergunta</li>
            <li><strong>Busca vetorial</strong>: Converte a pergunta em embedding e busca os 3 documentos mais similares na base</li>
            <li><strong>Contexto enriquecido</strong>: Adiciona o conteúdo relevante ao prompt da IA</li>
            <li><strong>Resposta precisa</strong>: A IA responde usando o conhecimento específico encontrado</li>
          </ol>
          <p className="text-muted-foreground mt-4">
            Isso garante que o chatbot tenha acesso ao conhecimento mais atualizado e específico sobre 
            Jefferson Lobo, Método DEL e seus serviços.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
