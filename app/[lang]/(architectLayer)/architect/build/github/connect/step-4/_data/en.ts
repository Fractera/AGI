import type { WorkspacePageWords } from '@/lib/collection/types'
import { stepFourStrings } from '../../../_connect/panel/default-template/_step4'

// ЗАГОЛОВОК БЕРЁТСЯ У САМОГО ШАГА (274-4) — вторая копия названия разошлась бы с первой молча.
export const en: WorkspacePageWords = {
  title: stepFourStrings('en').title,
  lead: "One step of connecting a repository to this node.",
}
