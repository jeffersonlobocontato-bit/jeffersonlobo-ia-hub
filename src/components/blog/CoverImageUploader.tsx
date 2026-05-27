import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  value?: string | null;
  alt?: string | null;
  onChange: (url: string | null, alt?: string) => void;
}

export const CoverImageUploader = ({ value, alt, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 5MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('blog-covers').upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('blog-covers').getPublicUrl(path);
      onChange(data.publicUrl, alt || '');
      toast({ title: 'Foto enviada!' });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Foto de capa</Label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt={alt || ''} className="max-h-40 border-2 border-border" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-7 w-7"
            onClick={() => onChange(null)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-sm font-bold uppercase">
            {uploading ? 'Enviando...' : 'Selecionar imagem'}
          </span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      )}
      {value && (
        <div className="space-y-1">
          <Label className="text-xs">Texto alternativo (SEO/acessibilidade)</Label>
          <Input
            value={alt || ''}
            onChange={(e) => onChange(value, e.target.value)}
            placeholder="Descreva a imagem em uma frase"
            maxLength={140}
          />
        </div>
      )}
    </div>
  );
};
