import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Plus } from 'lucide-react';

interface AdminFeaturesTabProps {
  data: any[];
  onUpdate: (features: any[]) => void;
  onSave: (feature: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const AdminFeaturesTab = ({ data, onUpdate, onSave, onDelete, onAdd }: AdminFeaturesTabProps) => {
  return (
    <div className="space-y-4">
      <Button onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Feature
      </Button>

      {data.map((feature) => (
        <Card key={feature.id}>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>{feature.title}</span>
              <Button variant="destructive" size="sm" onClick={() => onDelete(feature.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone (nome do Lucide)</Label>
                <Input
                  value={feature.icon}
                  onChange={(e) =>
                    onUpdate(data.map((f) => (f.id === feature.id ? { ...f, icon: e.target.value } : f)))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={feature.title}
                  onChange={(e) =>
                    onUpdate(data.map((f) => (f.id === feature.id ? { ...f, title: e.target.value } : f)))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={feature.description}
                onChange={(e) =>
                  onUpdate(data.map((f) => (f.id === feature.id ? { ...f, description: e.target.value } : f)))
                }
                rows={3}
              />
            </div>

            <Button onClick={() => onSave(feature)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Feature
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
