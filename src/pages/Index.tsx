import { SEO } from '@/components/SEO';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TesteIASection from '@/components/TesteIASection';
import AcademiaSection from '@/components/AcademiaSection';
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
import ScrollFX from '@/components/ScrollFX';

// Cada seção sobe e aparece ao entrar na tela (ver [data-reveal] em index.css)
const Reveal = ({ children }: { children: React.ReactNode }) => (
  <div data-reveal>{children}</div>
);

const Divider = ({ accent = 'primary' }: { accent?: 'primary' | 'secondary' }) => (
  <div className="py-10 md:py-14">
    <Separator
      className={`h-[2px] bg-gradient-to-r from-transparent via-${accent}/30 to-transparent`}
    />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ScrollFX />
      <SEO
        title="Jefferson Lobo — Palestrante de Inteligência Artificial no Brasil"
        description="Palestrante de Inteligência Artificial no Brasil, autor do Método DEL e consultor de IA aplicada a marketing e negócios. Head Executivo de Marketing do Sistema Fiep."
        path="/"
      />
      <Header />
      <main className="relative z-[1]">
        <HeroSection />
        <Divider />
        <Reveal><TesteIASection /></Reveal>
        <Reveal><AcademiaSection /></Reveal>
        <Reveal><LogosBarSection /></Reveal>
        <Divider accent="secondary" />
        <Reveal><PalestrasSection /></Reveal>
        <Divider />
        <Reveal><AboutSection /></Reveal>
        <Divider accent="secondary" />
        <Reveal><TrustBarSection /></Reveal>
        <Reveal><StagePhotosSection /></Reveal>
        <Divider />
        <Reveal><ContactSection /></Reveal>
        <Divider accent="secondary" />
        <Reveal><BookSection /></Reveal>
        <Divider />
        <Reveal><PodcastSection /></Reveal>
        <Divider accent="secondary" />
        <Reveal><BlogSection /></Reveal>
      </main>
      <Footer />
      <ChatBot />
      <StickyHeaderCTA />
    </div>
  );
};

export default Index;
