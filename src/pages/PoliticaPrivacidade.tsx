import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <SEO
        title="Política de Privacidade — Jefferson Lobo"
        description="Saiba como o site de Jefferson Lobo coleta, usa e protege seus dados pessoais. Política de privacidade em conformidade com a LGPD."
        path="/politica-privacidade"
      />
      <Header />
      <main className="flex-1 pt-20">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
            Política de Privacidade
          </h1>
          
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">1. Informações que Coletamos</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Coletamos informações pessoais fornecidas voluntariamente por você ao usar nossos serviços, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de WhatsApp</li>
                <li>Respostas aos questionários de avaliação</li>
                <li>Histórico de interações com nossos sistemas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">2. Como Usamos suas Informações</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Utilizamos as informações coletadas para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência</li>
                <li>Processar e analisar suas respostas aos testes</li>
                <li>Enviar comunicações relevantes sobre nossos serviços</li>
                <li>Entrar em contato quando necessário</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">3. Compartilhamento de Informações</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. 
                Podemos compartilhar informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Com seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Com prestadores de serviços que nos auxiliam na operação do site</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">4. Segurança dos Dados</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações 
                pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">5. Seus Direitos (LGPD)</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Revogar o consentimento</li>
                <li>Obter informações sobre o compartilhamento de dados</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">6. Cookies e Tecnologias Similares</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência em nosso site, 
                personalizar conteúdo e analisar o tráfego. Você pode controlar o uso de cookies através 
                das configurações do seu navegador.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">7. Retenção de Dados</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos 
                para os quais foram coletadas, incluindo requisitos legais, contábeis ou de relatórios.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">8. Alterações nesta Política</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
                quaisquer alterações significativas publicando a nova política nesta página.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">9. Contato</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
                entre em contato através dos canais disponíveis em nosso site.
              </p>
              <p className="text-sm mt-4">
                <strong>Última atualização:</strong> Novembro de 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}