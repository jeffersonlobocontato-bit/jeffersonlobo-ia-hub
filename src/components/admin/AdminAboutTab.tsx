import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminAboutTabProps {
  data: any;
  onUpdate: (data: any) => void;
  onSave: () => void;
}

export const AdminAboutTab = ({ data, onUpdate, onSave }: AdminAboutTabProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!data) return <div>Carregando...</div>;

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `profile/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      onUpdate({ ...data, profile_image: publicUrl });
      toast({ title: "Upload realizado!", description: "A imagem foi enviada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo Sobre</CardTitle>
        <CardDescription>Edite o título, descrição e imagens da seção sobre</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nome Destacado</Label>
          <Input
            value={data.name || ''}
            onChange={(e) => onUpdate({ ...data, name: e.target.value })}
            placeholder="JEFFERSON LOBO"
          />
        </div>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={data.title || ''}
            onChange={(e) => onUpdate({ ...data, title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Linha de Destaque</Label>
          <Input
            value={data.read_line || ''}
            onChange={(e) => onUpdate({ ...data, read_line: e.target.value })}
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
          <Label>Foto de Perfil</Label>
          {data.profile_image && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20 mb-2">
              <img src={data.profile_image} alt="Preview" className="w-full h-full object-cover" />
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
                if (file) uploadImage(file);
              }}
              disabled={uploading}
            />
          </label>
          <Input
            value={data.profile_image || ''}
            onChange={(e) => onUpdate({ ...data, profile_image: e.target.value })}
            placeholder="Ou cole uma URL"
          />
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  );
};
