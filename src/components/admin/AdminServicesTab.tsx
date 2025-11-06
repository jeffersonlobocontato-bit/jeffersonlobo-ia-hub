import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Plus } from 'lucide-react';

interface AdminServicesTabProps {
  data: any[];
  onUpdate: (services: any[]) => void;
  onSave: (service: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const AdminServicesTab = ({ data, onUpdate, onSave, onDelete, onAdd }: AdminServicesTabProps) => {
  return (
    <div className="space-y-4">
      <Button onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Serviço
      </Button>

      {data.map((service) => (
        <Card key={service.id}>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>{service.title}</span>
              <Button variant="destructive" size="sm" onClick={() => onDelete(service.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone (nome do Lucide)</Label>
                <Input
                  value={service.icon}
                  onChange={(e) =>
                    onUpdate(data.map((s) => (s.id === service.id ? { ...s, icon: e.target.value } : s)))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={service.title}
                  onChange={(e) =>
                    onUpdate(data.map((s) => (s.id === service.id ? { ...s, title: e.target.value } : s)))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={service.description}
                onChange={(e) =>
                  onUpdate(data.map((s) => (s.id === service.id ? { ...s, description: e.target.value } : s)))
                }
                rows={3}
              />
            </div>

            <Button onClick={() => onSave(service)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Serviço
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
