import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CoverImageUploader } from '@/components/blog/CoverImageUploader';
import { MarkdownEditor } from '@/components/blog/MarkdownEditor';
import { slugify, calcReadingMinutes } from '@/lib/blog-utils';

interface AdminBlogTabProps {
  data: any[];
  onUpdate: (posts: any[]) => void;
  onSave: (post: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const AdminBlogTab = ({ data, onUpdate, onSave, onDelete, onAdd }: AdminBlogTabProps) => {
  const [seoOpen, setSeoOpen] = useState<Record<string, boolean>>({});
  const patch = (id: string, fields: any) =>
    onUpdate(data.map((p) => (p.id === id ? { ...p, ...fields } : p)));

  return (
    <div className="space-y-4">
      <Button onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Post
      </Button>

      {data.map((post) => {
        const tagsStr = Array.isArray(post.tags) ? post.tags.join(', ') : '';
        return (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center gap-3">
                <span className="truncate">{post.title}</span>
                <Button variant="destructive" size="sm" onClick={() => onDelete(post.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={post.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const next: any = { title };
                    // auto-sugere slug se ele ainda for "novo-post-..." ou vazio
                    if (!post.slug || post.slug.startsWith('novo-post-')) {
                      next.slug = slugify(title);
                    }
                    patch(post.id, next);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Slug (URL: /blog/<span className="font-mono">{post.slug || '...'}</span>)</Label>
                <Input
                  value={post.slug || ''}
                  onChange={(e) => patch(post.id, { slug: slugify(e.target.value) })}
                  placeholder="meu-artigo-sobre-ia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={post.category || ''}
                    onChange={(e) => patch(post.id, { category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={post.date || ''}
                    onChange={(e) => patch(post.id, { date: e.target.value })}
                  />
                </div>
              </div>

              <CoverImageUploader
                value={post.cover_image}
                alt={post.cover_alt}
                onChange={(url, alt) => patch(post.id, { cover_image: url, cover_alt: alt ?? post.cover_alt })}
              />

              <div className="space-y-2">
                <Label>Resumo (1-2 frases — aparece na home e nas buscas)</Label>
                <Textarea
                  value={post.excerpt || ''}
                  onChange={(e) => patch(post.id, { excerpt: e.target.value })}
                  rows={3}
                  maxLength={280}
                />
                <p className="text-xs text-muted-foreground">{(post.excerpt || '').length}/280</p>
              </div>

              <MarkdownEditor
                value={post.content_md || ''}
                onChange={(v) =>
                  patch(post.id, { content_md: v, reading_minutes: calcReadingMinutes(v) })
                }
              />

              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={tagsStr}
                  onChange={(e) =>
                    patch(post.id, {
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="inteligência artificial, produtividade, futuro do trabalho"
                />
              </div>

              <div className="space-y-2">
                <Label>URL do LinkedIn (apenas se o post for externo)</Label>
                <Input
                  value={post.linkedin_url || ''}
                  onChange={(e) => patch(post.id, { linkedin_url: e.target.value })}
                  placeholder="https://www.linkedin.com/posts/..."
                />
                <p className="text-xs text-muted-foreground">
                  {post.content_md?.trim()
                    ? '✓ Post interno: leitores acessarão /blog/' + (post.slug || '')
                    : 'Sem conteúdo interno: card levará ao LinkedIn'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={post.active ?? true}
                  onCheckedChange={(v) => patch(post.id, { active: v })}
                />
                <Label>Publicado</Label>
              </div>

              <button
                type="button"
                onClick={() => setSeoOpen((s) => ({ ...s, [post.id]: !s[post.id] }))}
                className="flex items-center gap-1 text-sm font-bold uppercase text-muted-foreground hover:text-foreground"
              >
                {seoOpen[post.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                SEO avançado
              </button>

              {seoOpen[post.id] && (
                <div className="space-y-3 p-4 border-2 border-dashed border-border">
                  <div className="space-y-2">
                    <Label>SEO Title (60 caracteres ideal)</Label>
                    <Input
                      value={post.seo_title || ''}
                      onChange={(e) => patch(post.id, { seo_title: e.target.value })}
                      maxLength={70}
                      placeholder="Deixe vazio para usar o título"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Description (160 caracteres ideal)</Label>
                    <Textarea
                      value={post.seo_description || ''}
                      onChange={(e) => patch(post.id, { seo_description: e.target.value })}
                      maxLength={180}
                      rows={2}
                      placeholder="Deixe vazio para usar o resumo"
                    />
                  </div>
                </div>
              )}

              <Button onClick={() => onSave(post)} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Post
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
