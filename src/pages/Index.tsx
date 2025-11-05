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
        <div className="py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <AboutSection />
        <div className="py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>
        <BookSection />
        <div className="py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <BlogSection />
        <div className="py-20">
          <Separator className="h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
