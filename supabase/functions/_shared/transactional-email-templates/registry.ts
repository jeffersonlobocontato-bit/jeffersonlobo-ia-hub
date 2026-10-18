/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as briefingInternalNotification } from './briefing-internal-notification.tsx'
import { template as briefingLeadConfirmation } from './briefing-lead-confirmation.tsx'
import { template as cursoAcessoLiberado } from './curso-acesso-liberado.tsx'
import { template as pocketAcessoLiberado } from './pocket-acesso-liberado.tsx'
import { template as ebookSkillsEntrega } from './ebook-skills-entrega.tsx'
import { template as guiaEntrega } from './guia-entrega.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'briefing-internal-notification': briefingInternalNotification,
  'briefing-lead-confirmation': briefingLeadConfirmation,
  'curso-acesso-liberado': cursoAcessoLiberado,
  'pocket-acesso-liberado': pocketAcessoLiberado,
  'ebook-skills-entrega': ebookSkillsEntrega,
  'guia-entrega': guiaEntrega,
}
