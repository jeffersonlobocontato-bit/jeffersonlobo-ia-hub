import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface AdminHeroTabProps {
  data: any;
  onUpdate: (data: any) => void;
  onSave: () => void;
}

export const AdminHeroTab = ({ data, onUpdate, onSave }: AdminHeroTabProps) => {
  if (!data) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo do Hero</CardTitle>
        <CardDescription>Edite o título, subtítulo e estatísticas da página inicial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Título Principal</Label>
          <Input
            value={data.headline || ''}
            onChange={(e) => onUpdate({ ...data, headline: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Textarea
            value={data.subtitle || ''}
            onChange={(e) => onUpdate({ ...data, subtitle: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CTA Primário</Label>
            <Input
              value={data.cta_primary || ''}
              onChange={(e) => onUpdate({ ...data, cta_primary: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Secundário</Label>
            <Input
              value={data.cta_secondary || ''}
              onChange={(e) => onUpdate({ ...data, cta_secondary: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Estatística 1 - Número</Label>
            <Input
              value={data.stat1_number || ''}
              onChange={(e) => onUpdate({ ...data, stat1_number: e.target.value })}
            />
            <Label>Estatística 1 - Label</Label>
            <Input
              value={data.stat1_label || ''}
              onChange={(e) => onUpdate({ ...data, stat1_label: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Estatística 2 - Número</Label>
            <Input
              value={data.stat2_number || ''}
              onChange={(e) => onUpdate({ ...data, stat2_number: e.target.value })}
            />
            <Label>Estatística 2 - Label</Label>
            <Input
              value={data.stat2_label || ''}
              onChange={(e) => onUpdate({ ...data, stat2_label: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Estatística 3 - Número</Label>
            <Input
              value={data.stat3_number || ''}
              onChange={(e) => onUpdate({ ...data, stat3_number: e.target.value })}
            />
            <Label>Estatística 3 - Label</Label>
            <Input
              value={data.stat3_label || ''}
              onChange={(e) => onUpdate({ ...data, stat3_label: e.target.value })}
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
