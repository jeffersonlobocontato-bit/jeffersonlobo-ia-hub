import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminHeroTab } from '@/components/admin/AdminHeroTab';
import { AdminAboutTab } from '@/components/admin/AdminAboutTab';
import { AdminBookTab } from '@/components/admin/AdminBookTab';
import { AdminContactTab } from '@/components/admin/AdminContactTab';
import { AdminServicesTab } from '@/components/admin/AdminServicesTab';
import { AdminBlogTab } from '@/components/admin/AdminBlogTab';
import AdminPodcastTab from '@/components/admin/AdminPodcastTab';
import { AdminFeaturesTab } from '@/components/admin/AdminFeaturesTab';
import { AdminReviewsTab } from '@/components/admin/AdminReviewsTab';
import { AdminLeadsTab } from '@/components/admin/AdminLeadsTab';
import AdminChatLeadsTab from '@/components/admin/AdminChatLeadsTab';
import { AdminKnowledgeTab } from '@/components/admin/AdminKnowledgeTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';

const Admin = () => {
  const { signOut, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [heroData, setHeroData] = useState<any>(null);
  const [aboutData, setAboutData] = useState<any>(null);
  const [bookData, setBookData] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [bookFeatures, setBookFeatures] = useState<any[]>([]);
  const [bookReviews, setBookReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllContent();
    }
  }, [user]);

  const loadAllContent = async () => {
    try {
      setLoading(true);
      
      const [heroRes, aboutRes, bookRes, contactRes, servicesRes, postsRes, featuresRes, reviewsRes] = await Promise.all([
        supabase.from('hero_content').select('*').maybeSingle(),
        supabase.from('about_content').select('*').maybeSingle(),
        supabase.from('book_content').select('*').maybeSingle(),
        supabase.from('contact_info').select('*').maybeSingle(),
        supabase.from('services').select('*').order('display_order'),
        supabase.from('blog_posts').select('*').order('date', { ascending: false }),
        supabase.from('book_features').select('*').order('display_order'),
        supabase.from('book_reviews').select('*').order('display_order'),
      ]);

      setHeroData(heroRes.data);
      setAboutData(aboutRes.data);
      setBookData(bookRes.data);
      setContactData(contactRes.data);
      setServices(servicesRes.data || []);
      setBlogPosts(postsRes.data || []);
      setBookFeatures(featuresRes.data || []);
      setBookReviews(reviewsRes.data || []);
    } catch (error) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateHero = async () => {
    if (!heroData?.id) {
      toast({ title: "Erro", description: "Dados não carregados corretamente", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('hero_content')
      .update({ ...heroData, updated_by: user?.id })
      .eq('id', heroData.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo com sucesso!" });
    }
  };

  const updateAbout = async () => {
    if (!aboutData?.id) {
      toast({ title: "Erro", description: "Dados não carregados corretamente", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('about_content')
      .update({ ...aboutData, updated_by: user?.id })
      .eq('id', aboutData.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo com sucesso!" });
    }
  };

  const updateBook = async () => {
    if (!bookData?.id) {
      toast({ title: "Erro", description: "Dados não carregados corretamente", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('book_content')
      .update({ ...bookData, updated_by: user?.id })
      .eq('id', bookData.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo com sucesso!" });
    }
  };

  const updateContact = async () => {
    if (!contactData?.id) {
      toast({ title: "Erro", description: "Dados não carregados corretamente", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('contact_info')
      .update({ ...contactData, updated_by: user?.id })
      .eq('id', contactData.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo com sucesso!" });
    }
  };

  const updateService = async (service: any) => {
    const { error } = await supabase.from('services').update(service).eq('id', service.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Serviço atualizado!" });
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Serviço deletado!" });
      loadAllContent();
    }
  };

  const addService = async () => {
    const maxOrder = services.length > 0 ? Math.max(...services.map((s) => s.display_order)) : 0;
    const { error } = await supabase.from('services').insert({
      title: 'Novo Serviço',
      description: 'Descrição do serviço',
      icon: 'Briefcase',
      display_order: maxOrder + 1,
      active: true,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Serviço adicionado!" });
      loadAllContent();
    }
  };

  const updateBlogPost = async (post: any) => {
    const { error } = await supabase.from('blog_posts').update(post).eq('id', post.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post atualizado!" });
    }
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deletado!" });
      loadAllContent();
    }
  };

  const addBlogPost = async () => {
    const { error } = await supabase.from('blog_posts').insert({
      title: 'Novo Post',
      excerpt: 'Resumo do post',
      category: 'Categoria',
      date: new Date().toISOString().split('T')[0],
      linkedin_url: '',
      active: true,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post adicionado!" });
      loadAllContent();
    }
  };

  const updateBookFeature = async (feature: any) => {
    const { error } = await supabase.from('book_features').update(feature).eq('id', feature.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature atualizada!" });
    }
  };

  const deleteBookFeature = async (id: string) => {
    const { error } = await supabase.from('book_features').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature deletada!" });
      loadAllContent();
    }
  };

  const addBookFeature = async () => {
    const maxOrder = bookFeatures.length > 0 ? Math.max(...bookFeatures.map((f) => f.display_order)) : 0;
    const { error } = await supabase.from('book_features').insert({
      title: 'Nova Feature',
      description: 'Descrição da feature',
      icon: 'BookOpen',
      display_order: maxOrder + 1,
      active: true,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature adicionada!" });
      loadAllContent();
    }
  };

  const updateBookReview = async (review: any) => {
    const { error } = await supabase.from('book_reviews').update(review).eq('id', review.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação atualizada!" });
    }
  };

  const deleteBookReview = async (id: string) => {
    const { error } = await supabase.from('book_reviews').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação deletada!" });
      loadAllContent();
    }
  };

  const addBookReview = async () => {
    const maxOrder = bookReviews.length > 0 ? Math.max(...bookReviews.map((r) => r.display_order)) : 0;
    const { error } = await supabase.from('book_reviews').insert({
      rating: 5.0,
      review_text: 'Nova avaliação',
      reviewer_name: 'Nome do Avaliador',
      reviewer_title: 'Cargo',
      display_order: maxOrder + 1,
      active: true,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação adicionada!" });
      loadAllContent();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
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
      {/* Debug Auth Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-500/90 text-white text-xs py-1 px-4 text-center font-mono">
          Admin Panel - User: {user?.email} | Admin: {isAdmin ? '✅' : '❌'} | User ID: {user?.id?.substring(0, 8)}...
        </div>
      )}
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
          <TabsList className="inline-flex w-full mb-8 overflow-x-auto">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="book">Livro</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="podcast">Podcast</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="leads">Leads IA</TabsTrigger>
            <TabsTrigger value="chat-leads">Chat</TabsTrigger>
            <TabsTrigger value="knowledge">Base RAG</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <AdminHeroTab data={heroData} onUpdate={setHeroData} onSave={updateHero} />
          </TabsContent>

          <TabsContent value="about">
            <AdminAboutTab data={aboutData} onUpdate={setAboutData} onSave={updateAbout} />
          </TabsContent>

          <TabsContent value="services">
            <AdminServicesTab
              data={services}
              onUpdate={setServices}
              onSave={updateService}
              onDelete={deleteService}
              onAdd={addService}
            />
          </TabsContent>

          <TabsContent value="book">
            <AdminBookTab data={bookData} onUpdate={setBookData} onSave={updateBook} />
          </TabsContent>

          <TabsContent value="features">
            <AdminFeaturesTab
              data={bookFeatures}
              onUpdate={setBookFeatures}
              onSave={updateBookFeature}
              onDelete={deleteBookFeature}
              onAdd={addBookFeature}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <AdminReviewsTab
              data={bookReviews}
              onUpdate={setBookReviews}
              onSave={updateBookReview}
              onDelete={deleteBookReview}
              onAdd={addBookReview}
            />
          </TabsContent>

          <TabsContent value="blog">
            <AdminBlogTab
              data={blogPosts}
              onUpdate={setBlogPosts}
              onSave={updateBlogPost}
              onDelete={deleteBlogPost}
              onAdd={addBlogPost}
            />
          </TabsContent>

          <TabsContent value="podcast">
            <AdminPodcastTab />
          </TabsContent>

          <TabsContent value="leads">
            <AdminLeadsTab />
          </TabsContent>

          <TabsContent value="chat-leads">
            <AdminChatLeadsTab />
          </TabsContent>

          <TabsContent value="knowledge">
            <AdminKnowledgeTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalyticsTab />
          </TabsContent>

          <TabsContent value="contact">
            <AdminContactTab data={contactData} onUpdate={setContactData} onSave={updateContact} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
