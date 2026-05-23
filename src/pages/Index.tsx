import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TesteIASection from '@/components/TesteIASection';
import TrustBarSection from '@/components/TrustBarSection';
import AboutSection from '@/components/AboutSection';
import BookSection from '@/components/BookSection';
import PodcastSection from '@/components/PodcastSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';


import StickyHeaderCTA from '@/components/StickyHeaderCTA';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  useEffect(() => {
    // Set dark mode by default for the tech aesthetic
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Jefferson Lobo — Estrategista de IA, Palestrante e Autor</title>
        <meta name="description" content="Diagnóstico, estratégia e implementação de IA para empresas e profissionais. Faça o Teste de Maturidade em IA gratuito em 8 minutos." />
        <link rel="canonical" href="https://jeffersonlobo.tech/" />
        <meta property="og:title" content="Jefferson Lobo — Estrategista de IA" />
        <meta property="og:description" content="IA está redesenhando empresas e carreiras. Lidere essa transformação." />
        <meta property="og:url" content="https://jeffersonlobo.tech/" />
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <div className="py-12 md:py-16 lg:py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <TesteIASection />
        <TrustBarSection />
        <div className="py-12 md:py-16 lg:py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>
        <AboutSection />
        <div className="py-12 md:py-16 lg:py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <BookSection />
        <div className="py-12 md:py-16 lg:py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <PodcastSection />
        <div className="py-12 md:py-16 lg:py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>
        <BlogSection />
        <div className="py-12 md:py-16 lg:py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>
        <ContactSection />

      </main>
      <Footer />
      <ChatBot />
      <StickyHeaderCTA />
    </div>
  );
};

export default Index;
