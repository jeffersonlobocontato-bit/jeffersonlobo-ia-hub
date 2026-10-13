import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  nome?: string
  curso?: string
  link?: string
}

const CursoAcessoLiberado = ({ nome, curso = 'Ilha de Edição completa', link = 'https://jeffersonlobo.tech/cursos/entrar' }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu acesso está liberado. Comece pela Aula 1.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={banner}>
          <Text style={kicker}>ACESSO LIBERADO</Text>
          <Heading style={title}>
            {nome ? `${nome.split(' ')[0]}, sua` : 'Sua'} <span style={{ color: '#A8CC84' }}>Ilha</span> começa agora.
          </Heading>
          <Text style={bannerText}>{curso}</Text>
        </Section>

        <Section style={body}>
          <Text style={paragraph}>
            Obrigado por entrar. As 5 aulas, os manuais, o instalador e os seus bônus,
            o e-book <strong>O código invisível</strong> e os <strong>3 pockets</strong>, já estão na sua área do aluno.
          </Text>
          <Text style={paragraph}>
            Para entrar, use <strong>este mesmo e-mail</strong>. Você recebe um link de acesso
            na hora, sem senha para decorar.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center' as const, padding: '4px 0 22px' }}>
          <Link href={link} style={cta}>ENTRAR NA ÁREA DO ALUNO →</Link>
        </Section>

        <Section style={steps}>
          <Text style={stepsTitle}>O CAMINHO MAIS RÁPIDO</Text>
          <Text style={step}><strong>1.</strong> Assista à Aula 1 com o Claude aberto ao lado e vá fazendo junto.</Text>
          <Text style={step}><strong>2.</strong> Baixe o ilha-de-edicao.zip, que fica logo abaixo da aula. Não precisa descompactar.</Text>
          <Text style={step}><strong>3.</strong> Quando o Claude criar a tarefa agendada, ligue <strong>Aprovar automaticamente</strong>.</Text>
          <Text style={step}>Ficou com dúvida? O Tutor da Ilha responde dentro de cada aula, a qualquer hora.</Text>
        </Section>

        <Section style={body}>
          <Text style={note}>
            Uma regra que vale para sempre: ninguém, nem o Claude, vai te pedir senha ou chave pelo chat.
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
  component: CursoAcessoLiberado,
  subject: (data: Record<string, any>) => `Seu acesso à ${data?.curso ?? 'Ilha de Edição completa'} está liberado`,
  displayName: 'Curso — acesso liberado',
  previewData: {
    nome: 'Maria Silva',
    curso: 'Ilha de Edição completa',
    link: 'https://jeffersonlobo.tech/cursos/entrar?curso=ilha&email=maria%40exemplo.com',
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
