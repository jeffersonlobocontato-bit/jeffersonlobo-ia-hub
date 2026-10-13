import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

// E-mail de acesso liberado para quem compra um pocket avulso (R$ 9,90).
interface Props {
  nome?: string
  /** nome do pocket, ex.: "Pocket 2 · Claude com a sua voz" */
  curso?: string
  link?: string
}

const PocketAcessoLiberado = ({ nome, curso = 'Pocket 1 · Configurei o Claude errado', link = 'https://jeffersonlobo.tech/cursos/entrar' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>O seu pocket está liberado. O PDF já está na sua área do aluno.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={banner}>
          <Text style={kicker}>POCKET LIBERADO</Text>
          <Heading style={title}>
            {nome ? `${nome.split(' ')[0]}, o seu` : 'O seu'} <span style={{ color: '#A8CC84' }}>pocket</span> chegou.
          </Heading>
          <Text style={bannerText}>{curso}</Text>
        </Section>

        <Section style={body}>
          <Text style={paragraph}>
            Obrigado pela compra. O PDF, com as telas do Claude em português, os modelos para copiar e o checklist,
            já está na sua área do aluno.
          </Text>
          <Text style={paragraph}>
            Para entrar, use <strong>este mesmo e-mail</strong>. Você recebe um link de acesso na hora, sem senha para decorar.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center' as const, padding: '4px 0 22px' }}>
          <Link href={link} style={cta}>BAIXAR O MEU POCKET →</Link>
        </Section>

        <Section style={steps}>
          <Text style={stepsTitle}>COMO APROVEITAR</Text>
          <Text style={step}><strong>1.</strong> Baixe o PDF e abra ao lado do Claude.</Text>
          <Text style={step}><strong>2.</strong> Siga os passos na ordem, copiando os modelos.</Text>
          <Text style={step}><strong>3.</strong> No fim, marque o checklist. Travou? O Tutor IA responde na área do aluno.</Text>
        </Section>

        <Section style={body}>
          <Text style={note}>
            O PDF sai com o seu e-mail em cada página: é uma licença pessoal. Ninguém, nem o Claude, vai te pedir senha ou chave pelo chat.
          </Text>
          <Text style={note}>
            Você tem 7 dias de garantia. Se não fizer sentido para você, é só pedir o reembolso pelo WhatsApp.
          </Text>
        </Section>

        <Section style={footerBox}>
          <Text style={signature}>— Jefferson Lobo</Text>
          <Text style={signatureMeta}>
            <Link href="https://wa.me/5545999864213" style={inlineLink}>Suporte no WhatsApp</Link>
            {'  ·  '}
            <Link href="https://jeffersonlobo.tech/cursos" style={inlineLink}>jeffersonlobo.tech/cursos</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PocketAcessoLiberado,
  subject: (data: Record<string, any>) => `O seu pocket está liberado: ${data?.curso ?? 'Academia jeffersonlobo.tech'}`,
  displayName: 'Pocket — acesso liberado',
  previewData: {
    nome: 'Maria Silva',
    curso: 'Pocket 2 · Claude com a sua voz',
    link: 'https://jeffersonlobo.tech/cursos/entrar?curso=pocket-voz&email=maria%40exemplo.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#F0EDE3', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }
const banner = {
  backgroundColor: '#111A17',
  borderRadius: '14px',
  padding: '32px 28px',
  marginBottom: '22px',
}
const kicker = {
  fontFamily: 'Courier New, monospace',
  fontSize: '12px',
  letterSpacing: '4px',
  color: '#A8CC84',
  margin: '0 0 12px',
}
const title = { fontSize: '30px', lineHeight: '1.15', color: '#F0EDE3', margin: '0 0 10px', fontWeight: 800 }
const bannerText = { fontSize: '15px', color: 'rgba(240,237,227,0.75)', margin: 0 }
const body = { padding: '0 6px 6px' }
const paragraph = { fontSize: '16px', color: '#1B2823', lineHeight: '1.6', margin: '0 0 14px' }
const cta = {
  display: 'inline-block',
  backgroundColor: '#7EA55A',
  color: '#0D1411',
  fontSize: '15px',
  fontWeight: 800,
  letterSpacing: '1px',
  textDecoration: 'none',
  padding: '15px 26px',
  borderRadius: '999px',
}
const steps = {
  backgroundColor: '#ffffff',
  border: '1px solid #DDD8CC',
  borderLeft: '4px solid #7EA55A',
  borderRadius: '10px',
  padding: '18px 22px',
  margin: '0 0 20px',
}
const stepsTitle = { fontFamily: 'Courier New, monospace', fontSize: '12px', letterSpacing: '3px', color: '#4F7A34', margin: '0 0 10px' }
const step = { fontSize: '15px', color: '#1B2823', lineHeight: '1.55', margin: '0 0 8px' }
const note = { fontSize: '14px', color: '#4a4a44', lineHeight: '1.55', margin: '0 0 10px' }
const footerBox = { borderTop: '1px solid #DDD8CC', paddingTop: '16px', marginTop: '8px' }
const signature = { fontSize: '16px', fontWeight: 700, color: '#1B2823', margin: '0 0 4px' }
const signatureMeta = { fontSize: '13px', color: '#5d5a52', margin: 0 }
const inlineLink = { color: '#4F7A34', textDecoration: 'underline' }
