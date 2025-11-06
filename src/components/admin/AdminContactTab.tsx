import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface AdminContactTabProps {
  data: any;
  onUpdate: (data: any) => void;
  onSave: () => void;
}

export const AdminContactTab = ({ data, onUpdate, onSave }: AdminContactTabProps) => {
  if (!data) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Contato</CardTitle>
        <CardDescription>Edite email, WhatsApp e redes sociais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={data.email || ''}
            onChange={(e) => onUpdate({ ...data, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input
            value={data.whatsapp || ''}
            onChange={(e) => onUpdate({ ...data, whatsapp: e.target.value })}
            placeholder="+55 11 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label>LinkedIn URL</Label>
          <Input
            value={data.linkedin_url || ''}
            onChange={(e) => onUpdate({ ...data, linkedin_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Instagram URL</Label>
          <Input
            value={data.instagram_url || ''}
            onChange={(e) => onUpdate({ ...data, instagram_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>YouTube URL</Label>
          <Input
            value={data.youtube_url || ''}
            onChange={(e) => onUpdate({ ...data, youtube_url: e.target.value })}
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
