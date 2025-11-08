import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';

interface TrustStat {
  id: string;
  icon: string;
  value: string;
  label: string;
  display_order: number;
  active: boolean;
}

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_title: string;
  rating: number;
  display_order: number;
  active: boolean;
}

interface AdminTrustTabProps {
  trustStats: TrustStat[];
  testimonials: Testimonial[];
  onUpdateTrustStats: (stats: TrustStat[]) => void;
  onUpdateTestimonials: (testimonials: Testimonial[]) => void;
  onSaveStat: (stat: TrustStat) => Promise<void>;
  onDeleteStat: (id: string) => Promise<void>;
  onAddStat: () => Promise<void>;
  onSaveTestimonial: (testimonial: Testimonial) => Promise<void>;
  onDeleteTestimonial: (id: string) => Promise<void>;
  onAddTestimonial: () => Promise<void>;
}

export const AdminTrustTab = ({
  trustStats,
  testimonials,
  onUpdateTrustStats,
  onUpdateTestimonials,
  onSaveStat,
  onDeleteStat,
  onAddStat,
  onSaveTestimonial,
  onDeleteTestimonial,
  onAddTestimonial,
}: AdminTrustTabProps) => {
  const updateStat = (id: string, field: string, value: any) => {
    const updated = trustStats.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    onUpdateTrustStats(updated);
  };

  const updateTestimonial = (id: string, field: string, value: any) => {
    const updated = testimonials.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );
    onUpdateTestimonials(updated);
  };

  return (
    <div className="space-y-8">
      {/* Estatísticas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Estatísticas de Confiança</CardTitle>
          <Button onClick={onAddStat} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {trustStats.map((stat) => (
            <Card key={stat.id} className="p-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ícone (Lucide)</Label>
                    <Input
                      value={stat.icon}
                      onChange={(e) => updateStat(stat.id, 'icon', e.target.value)}
                      placeholder="Users, TrendingUp, Award, Star..."
                    />
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                      placeholder="127, 45+, 97%..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Label</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                    placeholder="Palestras realizadas..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={stat.display_order}
                      onChange={(e) =>
                        updateStat(stat.id, 'display_order', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={stat.active}
                      onCheckedChange={(checked) =>
                        updateStat(stat.id, 'active', checked)
                      }
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => onSaveStat(stat)} size="sm">
                    Salvar
                  </Button>
                  <Button
                    onClick={() => onDeleteStat(stat.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Depoimentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Depoimentos</CardTitle>
          <Button onClick={onAddTestimonial} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-4">
              <div className="grid gap-4">
                <div>
                  <Label>Depoimento</Label>
                  <Textarea
                    value={testimonial.quote}
                    onChange={(e) =>
                      updateTestimonial(testimonial.id, 'quote', e.target.value)
                    }
                    placeholder="Digite o depoimento..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Autor</Label>
                    <Input
                      value={testimonial.author_name}
                      onChange={(e) =>
                        updateTestimonial(testimonial.id, 'author_name', e.target.value)
                      }
                      placeholder="Carlos Silva"
                    />
                  </div>
                  <div>
                    <Label>Cargo do Autor</Label>
                    <Input
                      value={testimonial.author_title}
                      onChange={(e) =>
                        updateTestimonial(testimonial.id, 'author_title', e.target.value)
                      }
                      placeholder="CTO de empresa Fortune 500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Avaliação (0-5)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={testimonial.rating}
                      onChange={(e) =>
                        updateTestimonial(
                          testimonial.id,
                          'rating',
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={testimonial.display_order}
                      onChange={(e) =>
                        updateTestimonial(
                          testimonial.id,
                          'display_order',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={testimonial.active}
                      onCheckedChange={(checked) =>
                        updateTestimonial(testimonial.id, 'active', checked)
                      }
                    />
                    <Label>Ativo</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onSaveTestimonial(testimonial)}
                    size="sm"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => onDeleteTestimonial(testimonial.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
