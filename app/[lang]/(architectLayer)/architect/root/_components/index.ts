import type { Block } from '@/lib/content/blocks/types'
import { servicePortWords } from '@/components/services/service-port.i18n'

// The working part of «Root»: where the site element answers, asked in the browser —
// the page is prerendered, and a port is a fact about the machine (the same view as «Authorization»).
export function content(lang: string): Block[] {
  return [{ kind: 'servicePort', serviceId: 'root', words: servicePortWords(lang, 'root') }]
}
