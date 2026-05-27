import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export const MarkdownEditor = ({ value, onChange, label = 'Conteúdo (Markdown)' }: Props) => {
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
          {preview ? <Pencil className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {preview ? 'Editar' : 'Pré-visualizar'}
        </Button>
      </div>
      {preview ? (
        <div className="min-h-[300px] p-4 border-2 border-border bg-card prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '_Sem conteúdo_'}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={20}
          placeholder={'## Subtítulo\n\nSeu primeiro parágrafo aparecerá como resumo na home...'}
          className="font-mono text-sm"
        />
      )}
      <p className="text-xs text-muted-foreground">
        Deixe vazio para post externo (CTA para LinkedIn). Preenchido = post interno em /blog/:slug.
      </p>
    </div>
  );
};
