import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TesteIASection from '@/components/TesteIASection';
import LogosBarSection from '@/components/LogosBarSection';
import PalestrasSection from '@/components/PalestrasSection';
import TrustBarSection from '@/components/TrustBarSection';
import StagePhotosSection from '@/components/StagePhotosSection';
import AboutSection from '@/components/AboutSection';
import BookSection from '@/components/BookSection';
import PodcastSection from '@/components/PodcastSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import StickyHeaderCTA from '@/components/StickyHeaderCTA';
import { Separator } from '@/components/ui/separator';

const Divider = ({ accent = 'primary' }: { accent?: 'primary' | 'secondary' }) => (
  <div className="py-10 md:py-14">
    <Separator
      className={`h-[2px] bg-gradient-to-r from-transparent via-${accent}/30 to-transparent`}
    />
  </div>
);

const Index = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Jefferson Lobo — Palestrante de IA, Estrategista e Autor</title>
        <meta
          name="description"
          content="Palestras, workshops e consultoria em Inteligência Artificial para empresas e lideranças. Solicite uma proposta ou faça o Teste de Maturidade em IA gratuito."
        />
        <link rel="canonical" href="https://jeffersonlobo.tech/" />
        <meta property="og:title" content="Jefferson Lobo — Palestrante de IA" />
        <meta
          property="og:description"
          content="Leve a conversa de IA para dentro da sua empresa. Keynotes, workshops e consultoria estratégica."
        />
        <meta property="og:url" content="https://jeffersonlobo.tech/" />
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <Divider />
        <TesteIASection />
        <LogosBarSection />
        <Divider accent="secondary" />
        <PalestrasSection />
        <Divider />
        <AboutSection />
        <Divider accent="secondary" />
        <TrustBarSection />
        <StagePhotosSection />
        <Divider />
        <ContactSection />
        <Divider accent="secondary" />
        <BookSection />
        <Divider />
        <PodcastSection />
        <Divider accent="secondary" />
        <BlogSection />
      </main>
      <Footer />
      <ChatBot />
      <StickyHeaderCTA />
    </div>
  );
};

export default Index;
