import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Hero Content
  const [heroData, setHeroData] = useState<any>(null);
  
  // About Content
  const [aboutData, setAboutData] = useState<any>(null);
  
  // Book Content
  const [bookData, setBookData] = useState<any>(null);
  
  // Services
  const [services, setServices] = useState<any[]>([]);
  
  // Blog Posts
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    // Load Hero
    const { data: hero } = await supabase
      .from('hero_content')
      .select('*')
      .single();
    setHeroData(hero);

    // Load About
    const { data: about } = await supabase
      .from('about_content')
      .select('*')
      .single();
    setAboutData(about);

    // Load Book
    const { data: book } = await supabase
      .from('book_content')
      .select('*')
      .single();
    setBookData(book);

    // Load Services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('display_order');
    setServices(servicesData || []);

    // Load Blog Posts
    const { data: postsData } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });
    setBlogPosts(postsData || []);
  };

  const updateHeroContent = async () => {
    const { error } = await supabase
      .from('hero_content')
      .update({
        ...heroData,
        updated_by: user?.id,
      })
      .eq('id', heroData.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo com sucesso!",
        description: "O conteúdo do Hero foi atualizado.",
      });
    }
  };

  const updateAboutContent = async () => {
    const { error } = await supabase
      .from('about_content')
      .update({
        ...aboutData,
        updated_by: user?.id,
      })
      .eq('id', aboutData.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo com sucesso!",
        description: "O conteúdo Sobre foi atualizado.",
      });
    }
  };

  const updateBookContent = async () => {
    const { error } = await supabase
      .from('book_content')
      .update({
        ...bookData,
        updated_by: user?.id,
      })
      .eq('id', bookData.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo com sucesso!",
        description: "O conteúdo do Livro foi atualizado.",
      });
    }
  };

  const updateService = async (service: any) => {
    const { error } = await supabase
      .from('services')
      .update(service)
      .eq('id', service.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Serviço atualizado!",
      });
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Serviço deletado!",
      });
      loadAllContent();
    }
  };

  const updateBlogPost = async (post: any) => {
    const { error } = await supabase
      .from('blog_posts')
      .update(post)
      .eq('id', post.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post atualizado!",
      });
    }
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post deletado!",
      });
      loadAllContent();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!heroData || !aboutData || !bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie todo o conteúdo do site</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Ver Site
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="book">Livro</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {/* Hero Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Hero</CardTitle>
                <CardDescription>Edite o título, subtítulo e estatísticas da página inicial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título Principal</Label>
                  <Input
                    value={heroData.headline}
                    onChange={(e) => setHeroData({ ...heroData, headline: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Textarea
                    value={heroData.subtitle}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Primário</Label>
                    <Input
                      value={heroData.cta_primary}
                      onChange={(e) => setHeroData({ ...heroData, cta_primary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Secundário</Label>
                    <Input
                      value={heroData.cta_secondary}
                      onChange={(e) => setHeroData({ ...heroData, cta_secondary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Estatística 1 - Número</Label>
                    <Input
                      value={heroData.stat1_number}
                      onChange={(e) => setHeroData({ ...heroData, stat1_number: e.target.value })}
                    />
                    <Label>Estatística 1 - Label</Label>
                    <Input
                      value={heroData.stat1_label}
                      onChange={(e) => setHeroData({ ...heroData, stat1_label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estatística 2 - Número</Label>
                    <Input
                      value={heroData.stat2_number}
                      onChange={(e) => setHeroData({ ...heroData, stat2_number: e.target.value })}
                    />
                    <Label>Estatística 2 - Label</Label>
                    <Input
                      value={heroData.stat2_label}
                      onChange={(e) => setHeroData({ ...heroData, stat2_label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estatística 3 - Número</Label>
                    <Input
                      value={heroData.stat3_number}
                      onChange={(e) => setHeroData({ ...heroData, stat3_number: e.target.value })}
                    />
                    <Label>Estatística 3 - Label</Label>
                    <Input
                      value={heroData.stat3_label}
                      onChange={(e) => setHeroData({ ...heroData, stat3_label: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={updateHeroContent} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Sobre</CardTitle>
                <CardDescription>Edite o título e descrição da seção sobre</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={aboutData.title}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={aboutData.description}
                    onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                    rows={6}
                  />
                </div>

                <Button onClick={updateAboutContent} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{service.title}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteService(service.id)}
                      >
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
                            setServices(
                              services.map((s) =>
                                s.id === service.id ? { ...s, icon: e.target.value } : s
                              )
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={service.title}
                          onChange={(e) =>
                            setServices(
                              services.map((s) =>
                                s.id === service.id ? { ...s, title: e.target.value } : s
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) =>
                          setServices(
                            services.map((s) =>
                              s.id === service.id ? { ...s, description: e.target.value } : s
                            )
                          )
                        }
                        rows={3}
                      />
                    </div>

                    <Button onClick={() => updateService(service)} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Serviço
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Book Tab */}
          <TabsContent value="book">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Livro</CardTitle>
                <CardDescription>Edite as informações do livro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={bookData.title}
                    onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={bookData.subtitle}
                    onChange={(e) => setBookData({ ...bookData, subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={bookData.description}
                    onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link de Compra</Label>
                    <Input
                      value={bookData.purchase_link || ''}
                      onChange={(e) => setBookData({ ...bookData, purchase_link: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link da Amostra</Label>
                    <Input
                      value={bookData.sample_link || ''}
                      onChange={(e) => setBookData({ ...bookData, sample_link: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={updateBookContent} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{post.title}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBlogPost(post.id)}
                      >
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
                          setBlogPosts(
                            blogPosts.map((p) =>
                              p.id === post.id ? { ...p, title: e.target.value } : p
                            )
                          )
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Resumo</Label>
                      <Textarea
                        value={post.excerpt}
                        onChange={(e) =>
                          setBlogPosts(
                            blogPosts.map((p) =>
                              p.id === post.id ? { ...p, excerpt: e.target.value } : p
                            )
                          )
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Input
                          value={post.category}
                          onChange={(e) =>
                            setBlogPosts(
                              blogPosts.map((p) =>
                                p.id === post.id ? { ...p, category: e.target.value } : p
                              )
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={post.date}
                          onChange={(e) =>
                            setBlogPosts(
                              blogPosts.map((p) =>
                                p.id === post.id ? { ...p, date: e.target.value } : p
                              )
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL LinkedIn</Label>
                        <Input
                          value={post.linkedin_url || ''}
                          onChange={(e) =>
                            setBlogPosts(
                              blogPosts.map((p) =>
                                p.id === post.id ? { ...p, linkedin_url: e.target.value } : p
                              )
                            )
                          }
                        />
                      </div>
                    </div>

                    <Button onClick={() => updateBlogPost(post)} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Post
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;