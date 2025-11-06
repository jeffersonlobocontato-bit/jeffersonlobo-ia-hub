import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  nome: string;
  email: string;
  nivelMaturidade: string;
  scoreGeral: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, nivelMaturidade, scoreGeral }: EmailRequest = await req.json();

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Configuração de email não disponível' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .score { font-size: 48px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
            .nivel { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .cta { background: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Resultado do Teste de Maturidade em IA</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${nome}</strong>!</p>
              
              <p>Obrigado por realizar o Teste de Maturidade em IA. Aqui está o resumo do seu resultado:</p>
              
              <div class="score">${scoreGeral.toFixed(1)}/5.0</div>
              
              <div class="nivel">
                Nível de Maturidade: ${nivelMaturidade}
              </div>
              
              <p>Este resultado mostra sua posição atual em relação ao uso e domínio de Inteligência Artificial. Para ver o relatório completo com gráficos, análises detalhadas e recomendações personalizadas, acesse o site novamente.</p>
              
              <h3>📊 Próximos Passos</h3>
              <ul>
                <li>Revise suas áreas de oportunidade identificadas no teste</li>
                <li>Explore os conteúdos recomendados para seu perfil</li>
                <li>Considere uma consultoria personalizada para acelerar sua evolução</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="https://wa.me/5545999864213" class="cta">
                  💬 Falar com o Especialista
                </a>
              </div>
              
              <p>Quer acelerar sua jornada em IA? Entre em contato para conhecer o <strong>Método DEL</strong> e descobrir como transformar seus resultados através de consultoria especializada e treinamentos práticos.</p>
            </div>
            <div class="footer">
              <p>Jefferson Lobo - Especialista em Inteligência Artificial</p>
              <p>Este é um email automático. Para dúvidas, entre em contato via WhatsApp.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Jefferson Lobo <onboarding@resend.dev>',
        to: [email],
        subject: `🎯 Seu Resultado: ${nivelMaturidade} em IA (${scoreGeral.toFixed(1)}/5.0)`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }

    const data = await res.json();
    console.log('Email enviado com sucesso:', data);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na função send-test-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
