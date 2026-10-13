import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

// Entrega do e-book gratuito "50 skills do Claude" (isca da vitrine /cursos).
interface Props {
  nome?: string
  link?: string
}

const EbookSkillsEntrega = ({ nome, link = 'https://jeffersonlobo.tech/academia/50-skills-do-claude.pdf' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>O seu e-book chegou: 50 skills do Claude para quem cria, vende e comunica.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={banner}>
          <Text style={kicker}>E-BOOK GRÁTIS</Text>
          <Heading style={title}>
            {nome ? `${nome.split(' ')[0]}, as suas` : 'As suas'} <span style={{ color: '#2dd4bf' }}>50 skills</span> chegaram.
          </Heading>
          <Text style={bannerText}>50 skills do Claude para quem cria, vende e comunica · PDF, 15 páginas</Text>
        </Section>

        <Section style={body}>
          <Text style={paragraph}>
            Aqui está o guia. Cada skill foi conferida no repositório original e vem com onde funciona, como instalar
            e um pedido pronto para copiar.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center' as const, padding: '4px 0 22px' }}>
          <Link href={link} style={cta}>BAIXAR O E-BOOK →</Link>
        </Section>

        <Section style={steps}>
          <Text style={stepsTitle}>POR ONDE COMEÇAR</Text>
          <Text style={step}><strong>1.</strong> Na página 4, escolha a trilha do seu trabalho.</Text>
          <Text style={step}><strong>2.</strong> Ligue duas ou três skills e use por uma semana antes de pegar a próxima.</Text>
          <Text style={step}><strong>3.</strong> No fim do e-book, monte a skill que escreve com a sua voz.</Text>
        </Section>

        <Section style={body}>
          <Text style={note}>
            Quer um estúdio de conteúdo inteiro dentro do Claude, com reels, carrossel, stories e direct?
            Conheça a <Link href="https://jeffersonlobo.tech/cursos/ilha" style={inlineLink}>Ilha de Edição completa</Link>.
          </Text>
          <Text style={note}>
            Você recebeu este e-mail porque pediu o e-book em jeffersonlobo.tech/cursos. Veja como cuidamos dos seus
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
  component: EbookSkillsEntrega,
  subject: 'O seu e-book chegou: 50 skills do Claude',
  displayName: 'E-book 50 skills — entrega',
  previewData: {
    nome: 'Maria Silva',
    link: 'https://jeffersonlobo.tech/academia/50-skills-do-claude.pdf',
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
