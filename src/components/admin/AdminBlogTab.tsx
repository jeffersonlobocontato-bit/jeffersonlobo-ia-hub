import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Plus } from 'lucide-react';

interface AdminBlogTabProps {
  data: any[];
  onUpdate: (posts: any[]) => void;
  onSave: (post: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const AdminBlogTab = ({ data, onUpdate, onSave, onDelete, onAdd }: AdminBlogTabProps) => {
  return (
    <div className="space-y-4">
      <Button onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Post
      </Button>

      {data.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>{post.title}</span>
              <Button variant="destructive" size="sm" onClick={() => onDelete(post.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={post.title}
                onChange={(e) =>
                  onUpdate(data.map((p) => (p.id === post.id ? { ...p, title: e.target.value } : p)))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={post.category}
                  onChange={(e) =>
                    onUpdate(data.map((p) => (p.id === post.id ? { ...p, category: e.target.value } : p)))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={post.date}
                  onChange={(e) =>
                    onUpdate(data.map((p) => (p.id === post.id ? { ...p, date: e.target.value } : p)))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumo</Label>
              <Textarea
                value={post.excerpt}
                onChange={(e) =>
                  onUpdate(data.map((p) => (p.id === post.id ? { ...p, excerpt: e.target.value } : p)))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>URL do LinkedIn</Label>
              <Input
                value={post.linkedin_url}
                onChange={(e) =>
                  onUpdate(data.map((p) => (p.id === post.id ? { ...p, linkedin_url: e.target.value } : p)))
                }
              />
            </div>

            <Button onClick={() => onSave(post)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Post
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
