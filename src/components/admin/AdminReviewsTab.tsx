import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Plus } from 'lucide-react';

interface AdminReviewsTabProps {
  data: any[];
  onUpdate: (reviews: any[]) => void;
  onSave: (review: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const AdminReviewsTab = ({ data, onUpdate, onSave, onDelete, onAdd }: AdminReviewsTabProps) => {
  return (
    <div className="space-y-4">
      <Button onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Avaliação
      </Button>

      {data.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>{review.reviewer_name}</span>
              <Button variant="destructive" size="sm" onClick={() => onDelete(review.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Avaliador</Label>
                <Input
                  value={review.reviewer_name}
                  onChange={(e) =>
                    onUpdate(data.map((r) => (r.id === review.id ? { ...r, reviewer_name: e.target.value } : r)))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo/Título</Label>
                <Input
                  value={review.reviewer_title}
                  onChange={(e) =>
                    onUpdate(data.map((r) => (r.id === review.id ? { ...r, reviewer_title: e.target.value } : r)))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avaliação (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={review.rating}
                onChange={(e) =>
                  onUpdate(data.map((r) => (r.id === review.id ? { ...r, rating: parseFloat(e.target.value) } : r)))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Texto da Avaliação</Label>
              <Textarea
                value={review.review_text}
                onChange={(e) =>
                  onUpdate(data.map((r) => (r.id === review.id ? { ...r, review_text: e.target.value } : r)))
                }
                rows={4}
              />
            </div>

            <Button onClick={() => onSave(review)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Avaliação
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
