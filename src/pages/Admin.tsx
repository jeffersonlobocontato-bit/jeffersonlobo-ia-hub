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
import { LogOut, Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
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

  // Contact Info
  const [contactData, setContactData] = useState<any>(null);

  // Book Features
  const [bookFeatures, setBookFeatures] = useState<any[]>([]);
  
  // Book Reviews
  const [bookReviews, setBookReviews] = useState<any[]>([]);

  // Upload states
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingBookCover, setUploadingBookCover] = useState(false);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    console.log('📦 Admin - Carregando conteúdo...');
    try {
      // Load Hero
      console.log('🔵 Carregando Hero...');
      const { data: hero, error: heroError } = await supabase
        .from('hero_content')
        .select('*')
        .maybeSingle();
      console.log('Hero:', hero, 'Error:', heroError);
      setHeroData(hero);

      // Load About
      console.log('🔵 Carregando About...');
      const { data: about, error: aboutError } = await supabase
        .from('about_content')
        .select('*')
        .maybeSingle();
      console.log('About:', about, 'Error:', aboutError);
      setAboutData(about);

      // Load Book
      console.log('🔵 Carregando Book...');
      const { data: book, error: bookError } = await supabase
        .from('book_content')
        .select('*')
        .maybeSingle();
      console.log('Book:', book, 'Error:', bookError);
      setBookData(book);

      // Load Services
      console.log('🔵 Carregando Services...');
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('display_order');
      console.log('Services:', servicesData);
      setServices(servicesData || []);

      // Load Blog Posts
      console.log('🔵 Carregando Blog Posts...');
      const { data: postsData } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });
      console.log('Blog Posts:', postsData);
      setBlogPosts(postsData || []);

      // Load Contact Info
      console.log('🔵 Carregando Contact...');
      const { data: contact } = await supabase
        .from('contact_info')
        .select('*')
        .maybeSingle();
      console.log('Contact:', contact);
      setContactData(contact);

      // Load Book Features
      console.log('🔵 Carregando Features...');
      const { data: featuresData } = await supabase
        .from('book_features')
        .select('*')
        .order('display_order');
      console.log('Features:', featuresData);
      setBookFeatures(featuresData || []);

      // Load Book Reviews
      console.log('🔵 Carregando Reviews...');
      const { data: reviewsData } = await supabase
        .from('book_reviews')
        .select('*')
        .order('display_order');
      console.log('Reviews:', reviewsData);
      setBookReviews(reviewsData || []);
      
      console.log('✅ Admin - Conteúdo carregado com sucesso');
    } catch (error) {
      console.error('❌ Admin - Erro ao carregar:', error);
    }
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

  const updateContactInfo = async () => {
    const { error } = await supabase
      .from('contact_info')
      .update({
        ...contactData,
        updated_by: user?.id,
      })
      .eq('id', contactData.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo com sucesso!",
        description: "As informações de contato foram atualizadas.",
      });
    }
  };

  // Book Features Management
  const addBookFeature = async () => {
    const maxOrder = bookFeatures.length > 0 
      ? Math.max(...bookFeatures.map(f => f.display_order)) 
      : 0;
      
    const { error } = await supabase
      .from('book_features')
      .insert({
        title: 'Nova Feature',
        description: 'Descrição da feature',
        icon: 'BookOpen',
        display_order: maxOrder + 1,
        active: true,
      });

    if (error) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Feature adicionada!" });
      loadAllContent();
    }
  };

  const updateBookFeature = async (feature: any) => {
    const { error } = await supabase
      .from('book_features')
      .update(feature)
      .eq('id', feature.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Feature atualizada!" });
    }
  };

  const deleteBookFeature = async (id: string) => {
    const { error } = await supabase
      .from('book_features')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Feature deletada!" });
      loadAllContent();
    }
  };

  // Book Reviews Management
  const addBookReview = async () => {
    const maxOrder = bookReviews.length > 0 
      ? Math.max(...bookReviews.map(r => r.display_order)) 
      : 0;
      
    const { error } = await supabase
      .from('book_reviews')
      .insert({
        rating: 5.0,
        review_text: 'Nova avaliação',
        reviewer_name: 'Nome do Avaliador',
        reviewer_title: 'Cargo',
        display_order: maxOrder + 1,
        active: true,
      });

    if (error) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Avaliação adicionada!" });
      loadAllContent();
    }
  };

  const updateBookReview = async (review: any) => {
    const { error } = await supabase
      .from('book_reviews')
      .update(review)
      .eq('id', review.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Avaliação atualizada!" });
    }
  };

  const deleteBookReview = async (id: string) => {
    const { error} = await supabase
      .from('book_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Avaliação deletada!" });
      loadAllContent();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const uploadProfileImage = async (file: File) => {
    try {
      setUploadingProfileImage(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `profile/${fileName}`;

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update state with new URL
      setAboutData({ ...aboutData, profile_image: publicUrl });

      toast({
        title: "Upload realizado!",
        description: "A imagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const uploadBookCover = async (file: File) => {
    try {
      setUploadingBookCover(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `books/${fileName}`;

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update state with new URL
      setBookData({ ...bookData, cover_image: publicUrl });

      toast({
        title: "Upload realizado!",
        description: "A capa do livro foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingBookCover(false);
    }
  };

  // Debug loading state
  console.log('🔍 Admin render check:', {
    heroData: !!heroData,
    aboutData: !!aboutData,
    bookData: !!bookData,
    contactData: !!contactData,
  });

  if (!heroData || !aboutData || !bookData || !contactData) {
    console.log('⏳ Still loading - Missing data:', {
      hero: !heroData,
      about: !aboutData,
      book: !bookData,
      contact: !contactData
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  console.log('✅ All data loaded, rendering admin panel');

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
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="book">Livro</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
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
                <CardDescription>Edite o título, descrição e imagens da seção sobre</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Destacado</Label>
                  <Input
                    value={aboutData.name || ''}
                    onChange={(e) => setAboutData({ ...aboutData, name: e.target.value })}
                    placeholder="JEFFERSON LOBO"
                  />
                  <p className="text-xs text-muted-foreground">Nome que aparecerá em destaque no perfil</p>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={aboutData.title}
                    onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                    placeholder="Sobre Jefferson Lobo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Linha de Destaque (Read Line)</Label>
                  <Input
                    value={aboutData.read_line || ''}
                    onChange={(e) => setAboutData({ ...aboutData, read_line: e.target.value })}
                    placeholder="Ex: Transformando empresas através da IA"
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

                <div className="space-y-2">
                  <Label>Foto de Perfil</Label>
                  
                  {aboutData.profile_image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20 mb-2">
                      <img 
                        src={aboutData.profile_image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <label className="flex-1">
                      <div className="cursor-pointer">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          disabled={uploadingProfileImage}
                          asChild
                        >
                          <span>
                            {uploadingProfileImage ? (
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
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadProfileImage(file);
                        }}
                        disabled={uploadingProfileImage}
                      />
                    </label>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs text-muted-foreground">Ou cole uma URL:</Label>
                    <Input
                      value={aboutData.profile_image || ''}
                      onChange={(e) => setAboutData({ ...aboutData, profile_image: e.target.value })}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="text-sm"
                    />
                  </div>
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
                <CardDescription>Edite as informações e capa do livro</CardDescription>
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

                <div className="space-y-2">
                  <Label>Capa do Livro</Label>
                  
                  {bookData.cover_image && (
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-primary/20 mb-2">
                      <img 
                        src={bookData.cover_image} 
                        alt="Preview da capa" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <label className="flex-1">
                      <div className="cursor-pointer">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          disabled={uploadingBookCover}
                          asChild
                        >
                          <span>
                            {uploadingBookCover ? (
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
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadBookCover(file);
                        }}
                        disabled={uploadingBookCover}
                      />
                    </label>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs text-muted-foreground">Ou cole uma URL:</Label>
                    <Input
                      value={bookData.cover_image || ''}
                      onChange={(e) => setBookData({ ...bookData, cover_image: e.target.value })}
                      placeholder="https://exemplo.com/capa.jpg"
                      className="text-sm"
                    />
                  </div>
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

          {/* Contact Tab */}
          <TabsContent value="contact">
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
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={contactData.whatsapp}
                    onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })}
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Redes Sociais</h4>
                  
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={contactData.linkedin_url || ''}
                      onChange={(e) => setContactData({ ...contactData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/seu-perfil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input
                      value={contactData.instagram_url || ''}
                      onChange={(e) => setContactData({ ...contactData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/seu-perfil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>YouTube URL</Label>
                    <Input
                      value={contactData.youtube_url || ''}
                      onChange={(e) => setContactData({ ...contactData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/@seu-canal"
                    />
                  </div>
                </div>

                <Button onClick={updateContactInfo} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Book Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features do Livro</CardTitle>
                <CardDescription>Gerencie as características destacadas do livro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={addBookFeature} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Feature
                </Button>

                <div className="space-y-4">
                  {bookFeatures.map((feature, index) => (
                    <Card key={feature.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">Feature #{index + 1}</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookFeature(feature)}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteBookFeature(feature.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                              value={feature.title}
                              onChange={(e) => {
                                const updated = bookFeatures.map(f =>
                                  f.id === feature.id ? { ...f, title: e.target.value } : f
                                );
                                setBookFeatures(updated);
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Ordem</Label>
                              <Input
                                type="number"
                                value={feature.display_order}
                                onChange={(e) => {
                                  const updated = bookFeatures.map(f =>
                                    f.id === feature.id ? { ...f, display_order: parseInt(e.target.value) } : f
                                  );
                                  setBookFeatures(updated);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Ativo</Label>
                              <select
                                value={feature.active ? 'true' : 'false'}
                                onChange={(e) => {
                                  const updated = bookFeatures.map(f =>
                                    f.id === feature.id ? { ...f, active: e.target.value === 'true' } : f
                                  );
                                  setBookFeatures(updated);
                                }}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                              >
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Book Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações do Livro</CardTitle>
                <CardDescription>Gerencie as avaliações e depoimentos sobre o livro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={addBookReview} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Avaliação
                </Button>

                <div className="space-y-4">
                  {bookReviews.map((review, index) => (
                    <Card key={review.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">Avaliação #{index + 1}</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookReview(review)}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteBookReview(review.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>Avaliação</Label>
                            <Textarea
                              value={review.review_text}
                              onChange={(e) => {
                                const updated = bookReviews.map(r =>
                                  r.id === review.id ? { ...r, review_text: e.target.value } : r
                                );
                                setBookReviews(updated);
                              }}
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome do Avaliador</Label>
                              <Input
                                value={review.reviewer_name}
                                onChange={(e) => {
                                  const updated = bookReviews.map(r =>
                                    r.id === review.id ? { ...r, reviewer_name: e.target.value } : r
                                  );
                                  setBookReviews(updated);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Cargo/Título</Label>
                              <Input
                                value={review.reviewer_title}
                                onChange={(e) => {
                                  const updated = bookReviews.map(r =>
                                    r.id === review.id ? { ...r, reviewer_title: e.target.value } : r
                                  );
                                  setBookReviews(updated);
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Rating</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={review.rating}
                                onChange={(e) => {
                                  const updated = bookReviews.map(r =>
                                    r.id === review.id ? { ...r, rating: parseFloat(e.target.value) } : r
                                  );
                                  setBookReviews(updated);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Ordem</Label>
                              <Input
                                type="number"
                                value={review.display_order}
                                onChange={(e) => {
                                  const updated = bookReviews.map(r =>
                                    r.id === review.id ? { ...r, display_order: parseInt(e.target.value) } : r
                                  );
                                  setBookReviews(updated);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Ativo</Label>
                              <select
                                value={review.active ? 'true' : 'false'}
                                onChange={(e) => {
                                  const updated = bookReviews.map(r =>
                                    r.id === review.id ? { ...r, active: e.target.value === 'true' } : r
                                  );
                                  setBookReviews(updated);
                                }}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                              >
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;