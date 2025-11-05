import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import BookSection from '@/components/BookSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  useEffect(() => {
    // Set dark mode by default for the tech aesthetic
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <AboutSection />
        <Separator className="bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <BookSection />
        <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <BlogSection />
        <Separator className="bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
