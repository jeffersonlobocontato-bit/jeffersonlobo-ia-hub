import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  nome?: string
  empresa?: string
  cargo?: string
  email?: string
  whatsapp?: string
  tipo?: string
  data_evento?: string
  formato?: string
  publico?: string
  cidade?: string
  mensagem?: string
  briefingId?: string
}

const InternalNotification = ({
  nome, empresa, cargo, email, whatsapp, tipo, data_evento,
  formato, publico, cidade, mensagem, briefingId,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>NOVO BRIEFING: {nome ?? 'lead'} {empresa ? `— ${empresa}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={banner}>
          <Text style={bannerKicker}>NOVO LEAD</Text>
          <Heading style={bannerTitle}>BRIEFING RECEBIDO</Heading>
        </Section>

        <Section style={card}>
          <Row label="Nome" value={nome} />
          <Row label="E-mail" value={email} />
          <Row label="WhatsApp" value={whatsapp} />
          <Row label="Empresa" value={empresa} />
          <Row label="Cargo" value={cargo} />
          <Hr style={hr} />
          <Row label="Tipo" value={tipo} />
          <Row label="Data do evento" value={data_evento} />
          <Row label="Formato" value={formato} />
          <Row label="Público" value={publico} />
          <Row label="Cidade" value={cidade} />
          {mensagem ? (
            <>
              <Hr style={hr} />
              <Text style={msgLabel}>MENSAGEM</Text>
              <Text style={msgText}>{mensagem}</Text>
            </>
          ) : null}
        </Section>

        <Section style={{ textAlign: 'center' as const, padding: '24px 0 8px' }}>
          <Link href="https://jeffersonlobo.tech/admin" style={cta}>
            ABRIR PAINEL →
          </Link>
        </Section>

        {briefingId ? (
          <Text style={meta}>ID: {briefingId}</Text>
        ) : null}
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <Text style={rowText}>
      <span style={rowLabel}>{label.toUpperCase()}: </span>
      <span style={rowValue}>{value}</span>
    </Text>
  )
}

export const template = {
  component: InternalNotification,
  subject: (d: Record<string, any>) =>
    `🟡 NOVO BRIEFING: ${d?.nome ?? 'Lead'}${d?.empresa ? ' — ' + d.empresa : ''}`,
  displayName: 'Briefing — notificação interna',
  previewData: {
    nome: 'Maria Silva',
    empresa: 'Acme Corp',
    cargo: 'Diretora de RH',
    email: 'maria@acme.com',
    whatsapp: '(45) 99999-9999',
    tipo: 'palestra',
    data_evento: '2026-08-15',
    formato: 'presencial',
    publico: '300 pessoas',
    cidade: 'Curitiba',
    mensagem: 'Convenção anual de líderes, abertura sobre IA aplicada.',
    briefingId: 'abc-123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const banner = {
  backgroundColor: '#FFD700',
  border: '3px solid #000000',
  boxShadow: '6px 6px 0 #000000',
  padding: '20px 24px',
  marginBottom: '24px',
}
const bannerKicker = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '12px',
  letterSpacing: '2px',
  margin: '0 0 6px',
  color: '#000000',
}
const bannerTitle = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '28px',
  textTransform: 'uppercase' as const,
  margin: 0,
  color: '#000000',
  letterSpacing: '1px',
}
const card = {
  backgroundColor: '#0a0a0a',
  border: '3px solid #000000',
  boxShadow: '6px 6px 0 #FFD700',
  padding: '20px 24px',
  color: '#ffffff',
}
const rowText = { fontSize: '14px', color: '#ffffff', margin: '6px 0', lineHeight: '1.5' }
const rowLabel = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  color: '#FFD700',
  fontSize: '12px',
  letterSpacing: '1px',
}
const rowValue = { color: '#ffffff' }
const hr = { borderColor: '#333', margin: '14px 0' }
const msgLabel = {
  fontFamily: 'Arial Black, Arial, sans-serif',
  color: '#FFD700',
  fontSize: '12px',
  letterSpacing: '1px',
  margin: '8px 0 4px',
}
const msgText = { fontSize: '14px', color: '#ffffff', lineHeight: '1.6', margin: 0 }
const cta = {
  display: 'inline-block',
  backgroundColor: '#FFD700',
  color: '#000000',
  fontFamily: 'Arial Black, Arial, sans-serif',
  fontSize: '16px',
  textDecoration: 'none',
  padding: '14px 28px',
  border: '3px solid #000000',
  boxShadow: '5px 5px 0 #000000',
  letterSpacing: '1px',
}
const meta = { fontSize: '11px', color: '#999', textAlign: 'center' as const, marginTop: '16px' }
