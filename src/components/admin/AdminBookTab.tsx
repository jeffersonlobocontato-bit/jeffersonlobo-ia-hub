import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminBookTabProps {
  data: any;
  onUpdate: (data: any) => void;
  onSave: () => void;
}

export const AdminBookTab = ({ data, onUpdate, onSave }: AdminBookTabProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!data) return <div>Carregando...</div>;

  const uploadCover = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `books/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      onUpdate({ ...data, cover_image: publicUrl });
      toast({ title: "Upload realizado!", description: "A capa foi enviada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo do Livro</CardTitle>
        <CardDescription>Edite as informações e capa do livro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={data.title || ''}
            onChange={(e) => onUpdate({ ...data, title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Input
            value={data.subtitle || ''}
            onChange={(e) => onUpdate({ ...data, subtitle: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={data.description || ''}
            onChange={(e) => onUpdate({ ...data, description: e.target.value })}
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label>Capa do Livro</Label>
          {data.cover_image && (
            <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-primary/20 mb-2">
              <img src={data.cover_image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="block">
            <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCover(file);
              }}
              disabled={uploading}
            />
          </label>
          <Input
            value={data.cover_image || ''}
            onChange={(e) => onUpdate({ ...data, cover_image: e.target.value })}
            placeholder="Ou cole uma URL"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Link de Compra</Label>
            <Input
              value={data.purchase_link || ''}
              onChange={(e) => onUpdate({ ...data, purchase_link: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Link da Amostra</Label>
            <Input
              value={data.sample_link || ''}
              onChange={(e) => onUpdate({ ...data, sample_link: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  );
};
