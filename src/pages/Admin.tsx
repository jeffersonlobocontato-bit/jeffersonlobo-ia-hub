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

const Admin = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [heroData, setHeroData] = useState<any>(null);
  const [aboutData, setAboutData] = useState<any>(null);
  const [bookData, setBookData] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllContent();
    }
  }, [user]);

  const loadAllContent = async () => {
    try {
      setLoading(true);
      
      const [heroRes, aboutRes, bookRes, contactRes] = await Promise.all([
        supabase.from('hero_content').select('*').maybeSingle(),
        supabase.from('about_content').select('*').maybeSingle(),
        supabase.from('book_content').select('*').maybeSingle(),
        supabase.from('contact_info').select('*').maybeSingle(),
      ]);

      setHeroData(heroRes.data || {});
      setAboutData(aboutRes.data || {});
      setBookData(bookRes.data || {});
      setContactData(contactRes.data || {});
    } catch (error) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateHero = async () => {
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="book">Livro</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <AdminHeroTab data={heroData} onUpdate={setHeroData} onSave={updateHero} />
          </TabsContent>

          <TabsContent value="about">
            <AdminAboutTab data={aboutData} onUpdate={setAboutData} onSave={updateAbout} />
          </TabsContent>

          <TabsContent value="book">
            <AdminBookTab data={bookData} onUpdate={setBookData} onSave={updateBook} />
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
