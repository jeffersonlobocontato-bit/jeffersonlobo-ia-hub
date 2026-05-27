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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'briefing-internal-notification': briefingInternalNotification,
  'briefing-lead-confirmation': briefingLeadConfirmation,
}
