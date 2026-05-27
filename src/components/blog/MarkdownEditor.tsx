import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Code2, Sparkles } from 'lucide-react';
import { RichEditor } from './RichEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export const MarkdownEditor = ({ value, onChange, label = 'Conteúdo' }: Props) => {
  const [raw, setRaw] = useState(false);

  const uploadImage = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const ext = file.name.split('.').pop();
        const path = `inline/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('blog-covers').upload(path, file, { upsert: false });
        if (error) {
          toast.error('Falha no upload: ' + error.message);
          return resolve(null);
        }
        const { data } = supabase.storage.from('blog-covers').getPublicUrl(path);
        resolve(data.publicUrl);
      };
      input.click();
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" />
          {label}
        </Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setRaw((r) => !r)}>
          <Code2 className="w-3 h-3 mr-1" />
          {raw ? 'Editor visual' : 'Markdown cru'}
        </Button>
      </div>
      {raw ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={20}
          placeholder={'## Subtítulo\n\nSeu primeiro parágrafo aparecerá como resumo na home...'}
          className="font-mono text-sm"
        />
      ) : (
        <RichEditor value={value} onChange={onChange} onUploadImage={uploadImage} />
      )}
      <p className="text-xs text-muted-foreground">
        Vazio = post externo (CTA para LinkedIn). Preenchido = post interno em /blog/:slug.
        Use o botão <Sparkles className="inline w-3 h-3 text-primary" /> para inserir uma frase de destaque.
      </p>
    </div>
  );
};
