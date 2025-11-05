import { Card } from '@/components/ui/card';
import { Mail, MessageSquare, Linkedin, Instagram, Youtube } from 'lucide-react';
import { useContactInfo } from '@/hooks/useContactInfo';

const ContactSection = () => {
  const { data: contactData } = useContactInfo();

  const socialLinks = [
    {
      icon: Linkedin,
      label: 'LinkedIn',
      url: contactData?.linkedin_url || 'https://linkedin.com',
      color: 'hover:text-[#0077B5]',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      url: contactData?.instagram_url || 'https://instagram.com',
      color: 'hover:text-[#E4405F]',
    },
    {
      icon: Youtube,
      label: 'YouTube',
      url: contactData?.youtube_url || 'https://youtube.com',
      color: 'hover:text-[#FF0000]',
    },
  ];

  return (
    <section id="contato" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Vamos conversar
              </h2>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Entre em contato para palestras, cursos ou consultorias
            personalizadas
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-8 animate-fade-in">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    Como posso ajudar você?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Estou disponível para palestras corporativas, workshops,
                    consultorias estratégicas e projetos personalizados de IA
                    e transformação digital.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <a
                        href={`mailto:${contactData?.email || 'contato@jeffersonlobo.com'}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {contactData?.email || 'contato@jeffersonlobo.com'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">WhatsApp</h4>
                      <a
                        href={`https://wa.me/${(contactData?.whatsapp || '+55 (11) 99999-9999').replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {contactData?.whatsapp || '+55 (11) 99999-9999'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-6 border-t border-border">
                  <h4 className="font-semibold mb-4">Conecte-se comigo</h4>
                  <div className="flex gap-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`}
                        aria-label={social.label}
                      >
                        <social.icon className="w-6 h-6" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
