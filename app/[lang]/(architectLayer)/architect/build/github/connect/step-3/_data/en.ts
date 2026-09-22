import type { WorkspacePageWords } from '@/lib/collection/types'
import { stepThreeStrings } from '../../../_connect/panel/default-template/_step3'

// ЗАГОЛОВОК БЕРЁТСЯ У САМОГО ШАГА (274-4) — вторая копия названия разошлась бы с первой молча.
export const en: WorkspacePageWords = {
  title: stepThreeStrings('en').title,
  lead: "One step of connecting a repository to this node.",
}
