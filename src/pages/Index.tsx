import { useEffect } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TesteIASection from '@/components/TesteIASection';
import LogosBarSection from '@/components/LogosBarSection';
import PalestrasSection from '@/components/PalestrasSection';
import TrustBarSection from '@/components/TrustBarSection';
import StagePhotosSection from '@/components/StagePhotosSection';
import AboutSection from '@/components/AboutSection';
import ProductsSection from '@/components/ProductsSection';
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
      <SEO
        title="Jefferson Lobo — Palestrante de IA, Estrategista e Autor"
        description="Palestras, workshops e consultoria em Inteligência Artificial para empresas e lideranças. Solicite uma proposta ou faça o Teste de Maturidade em IA gratuito."
        path="/"
      />
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
        <ProductsSection />
        <Divider />
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
