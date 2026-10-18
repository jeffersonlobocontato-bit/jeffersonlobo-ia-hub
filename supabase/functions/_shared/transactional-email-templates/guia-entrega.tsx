import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

// Entrega dos guias gratuitos da vitrine /cursos (foto que vende, 30 dias de
// conteúdo, atendimento no WhatsApp). Um modelo só: o título e os links vêm
// da função isca-ebook-email, a partir do material gravado no lead.
interface Props {
  nome?: string
  titulo?: string
  link?: string
  pdf?: string
}

const GuiaEntrega = ({
  nome,
  titulo = 'o seu guia',
  link = 'https://jeffersonlobo.tech/cursos',
  pdf,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{`O seu guia chegou: ${titulo}.`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={banner}>
          <Text style={kicker}>GUIA GRÁTIS</Text>
          <Heading style={title}>
            {nome ? `${nome.split(' ')[0]}, o seu guia chegou.` : 'O seu guia chegou.'}
          </Heading>
          <Text style={bannerText}>{titulo}</Text>
        </Section>

        <Section style={body}>
          <Text style={paragraph}>
            Os prompts estão prontos para copiar e funcionam na versão gratuita da IA que você já usa. Leia no celular
            e aplique no mesmo dia.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center' as const, padding: '4px 0 12px' }}>
          <Link href={link} style={cta}>ABRIR O GUIA →</Link>
        </Section>
        {pdf ? (
          <Section style={{ textAlign: 'center' as const, padding: '0 0 22px' }}>
            <Link href={pdf} style={inlineLink}>Prefere o PDF? Baixe aqui.</Link>
          </Section>
        ) : null}

        <Section style={steps}>
          <Text style={stepsTitle}>ANTES DE COMEÇAR</Text>
          <Text style={step}><strong>1.</strong> Separe 30 a 60 minutos sem interrupção.</Text>
          <Text style={step}><strong>2.</strong> Troque os trechos destacados dos prompts pelo seu negócio.</Text>
          <Text style={step}><strong>3.</strong> Revise tudo antes de publicar: a IA erra, e quem responde pelo resultado é você.</Text>
        </Section>

        <Section style={body}>
          <Text style={note}>
            Quer transformar isso em reels, carrosséis e stories toda semana, sem equipe? Conheça a{' '}
            <Link href="https://jeffersonlobo.tech/cursos/ilha" style={inlineLink}>Ilha de Edição</Link>.
          </Text>
          <Text style={note}>
            Você recebeu este e-mail porque pediu o guia em jeffersonlobo.tech/cursos. Veja como cuidamos dos seus
            dados na <Link href="https://jeffersonlobo.tech/cursos/privacidade" style={inlineLink}>política de privacidade</Link>.
          </Text>
        </Section>

        <Section style={footerBox}>
          <Text style={signature}>— Jefferson Lobo</Text>
          <Text style={signatureMeta}>
            Academia jeffersonlobo.tech · Agência de Inteligência Vozes
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: GuiaEntrega,
  subject: (data: Record<string, any>) => `O seu guia chegou: ${data?.titulo ?? 'material da Academia'}`,
  displayName: 'Guias grátis — entrega',
  previewData: {
    nome: 'Maria Silva',
    titulo: 'A foto que vende em 3 minutos',
    link: 'https://jeffersonlobo.tech/academia/guias/foto-que-vende.html',
    pdf: 'https://jeffersonlobo.tech/academia/guias/foto-que-vende.pdf',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f4f4f5', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }
const banner = {
  backgroundColor: '#050505',
  borderRadius: '14px',
  padding: '32px 28px',
  marginBottom: '22px',
}
const kicker = {
  fontFamily: 'Courier New, monospace',
  fontSize: '12px',
  letterSpacing: '4px',
  color: '#5eead4',
  margin: '0 0 12px',
}
const title = { fontSize: '30px', lineHeight: '1.15', color: '#f4f4f5', margin: '0 0 10px', fontWeight: 800 }
const bannerText = { fontSize: '15px', color: 'rgba(244,244,245,0.72)', margin: 0 }
const body = { padding: '0 6px 6px' }
const paragraph = { fontSize: '16px', color: '#18181b', lineHeight: '1.6', margin: '0 0 14px' }
const cta = {
  display: 'inline-block',
  backgroundColor: '#14b8a6',
  color: '#03110f',
  fontSize: '15px',
  fontWeight: 800,
  letterSpacing: '1px',
  textDecoration: 'none',
  padding: '15px 26px',
  borderRadius: '999px',
}
const steps = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderLeft: '4px solid #14b8a6',
  borderRadius: '10px',
  padding: '18px 22px',
  margin: '0 0 20px',
}
const stepsTitle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '12px',
  letterSpacing: '3px',
  color: '#0d9488',
  margin: '0 0 10px',
  fontWeight: 700,
}
const step = { fontSize: '15px', color: '#18181b', lineHeight: '1.55', margin: '0 0 6px' }
const note = { fontSize: '14px', color: '#52525b', lineHeight: '1.6', margin: '0 0 12px' }
const inlineLink = { color: '#0d9488', textDecoration: 'underline' }
const footerBox = { borderTop: '1px solid #e4e4e7', padding: '18px 6px 0', marginTop: '8px' }
const signature = { fontSize: '16px', color: '#18181b', fontWeight: 700, margin: '0 0 4px' }
const signatureMeta = { fontSize: '13px', color: '#71717a', margin: 0 }
