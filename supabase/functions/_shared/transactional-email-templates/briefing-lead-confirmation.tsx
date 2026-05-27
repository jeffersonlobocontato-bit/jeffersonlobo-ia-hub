import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  nome?: string
  tipo?: string
  data_evento?: string
  formato?: string
  publico?: string
  cidade?: string
}

const LeadConfirmation = ({ nome, tipo, data_evento, formato, publico, cidade }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Recebi seu briefing. Respondo em até 24h úteis.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={banner}>
          <Text style={bannerKicker}>BRIEFING RECEBIDO</Text>
          <Heading style={bannerTitle}>
            VALEU{nome ? `, ${nome.split(' ')[0].toUpperCase()}` : ''}!
          </Heading>
        </Section>

        <Section style={body}>
          <Text style={paragraph}>
            Recebi seu briefing aqui e já está na minha fila pessoal —
            <strong> não é robô, não é assistente</strong>. Eu mesmo respondo.
          </Text>
          <Text style={paragraph}>
            <strong>Retorno em até 24h úteis</strong> com próximos passos: uma
            conversa rápida pra alinhar contexto e, se fizer sentido, uma
            proposta sob medida.
          </Text>
        </Section>

        {(tipo || data_evento || formato || publico || cidade) ? (
          <Section style={summary}>
            <Text style={summaryTitle}>RESUMO DO QUE VOCÊ ENVIOU</Text>
            {tipo ? <Text style={summaryRow}><strong>Tipo:</strong> {tipo}</Text> : null}
            {data_evento ? <Text style={summaryRow}><strong>Data prevista:</strong> {data_evento}</Text> : null}
            {formato ? <Text style={summaryRow}><strong>Formato:</strong> {formato}</Text> : null}
            {publico ? <Text style={summaryRow}><strong>Público:</strong> {publico}</Text> : null}
            {cidade ? <Text style={summaryRow}><strong>Cidade:</strong> {cidade}</Text> : null}
          </Section>
        ) : null}

        <Section style={{ textAlign: 'center' as const, padding: '8px 0 16px' }}>
          <Text style={paragraph}>
            Quer adiantar? Descubra agora o nível de maturidade em IA da sua empresa:
          </Text>
          <Link href="https://jeffersonlobo.tech/teste-ia" style={cta}>
            FAZER TESTE DE MATURIDADE →
          </Link>
        </Section>

        <Section style={footerBox}>
          <Text style={signature}>— Jefferson Lobo</Text>
          <Text style={signatureMeta}>Palestrante e consultor de IA aplicada</Text>
          <Text style={signatureMeta}>
            <Link href="https://wa.me/5545999864213" style={inlineLink}>WhatsApp direto</Link>
            {'  ·  '}
            <Link href="https://jeffersonlobo.tech" style={inlineLink}>jeffersonlobo.tech</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: LeadConfirmation,
  subject: 'Recebi seu briefing — respondo em até 24h',
  displayName: 'Briefing — confirmação ao lead',
  previewData: {
    nome: 'Maria Silva',
    tipo: 'palestra',
    data_evento: '2026-08-15',
    formato: 'presencial',
    publico: '300 pessoas',
    cidade: 'Curitiba',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const banner = {
  backgroundColor: '#FFD700',
  border: '3px solid #000000',
  boxShadow: '6px 6px 0 #000000',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}
const bannerKicker = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '12px',
  letterSpacing: '3px',
  margin: '0 0 8px',
  color: '#000000',
}
const bannerTitle = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '32px',
  textTransform: 'uppercase' as const,
  margin: 0,
  color: '#000000',
  letterSpacing: '1px',
}
const body = { padding: '0 8px 16px' }
const paragraph = { fontSize: '15px', color: '#222', lineHeight: '1.6', margin: '0 0 14px' }
const summary = {
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  border: '3px solid #000000',
  boxShadow: '6px 6px 0 #FFD700',
  padding: '18px 22px',
  margin: '8px 0 24px',
}
const summaryTitle = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  color: '#FFD700',
  fontSize: '12px',
  letterSpacing: '2px',
  margin: '0 0 10px',
}
const summaryRow = { fontSize: '14px', color: '#ffffff', margin: '4px 0', lineHeight: '1.5' }
const cta = {
  display: 'inline-block',
  backgroundColor: '#000000',
  color: '#FFD700',
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  padding: '14px 24px',
  border: '3px solid #000000',
  boxShadow: '5px 5px 0 #FFD700',
  letterSpacing: '1px',
  marginTop: '8px',
}
const footerBox = { borderTop: '2px solid #000', paddingTop: '18px', marginTop: '16px' }
const signature = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '16px',
  color: '#000000',
  margin: '0 0 4px',
}
const signatureMeta = { fontSize: '12px', color: '#555', margin: '2px 0' }
const inlineLink = { color: '#000000', textDecoration: 'underline', fontWeight: 'bold' as const }
