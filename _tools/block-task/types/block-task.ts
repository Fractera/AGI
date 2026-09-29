// ФОРМА ОКНА ЗАДАЧИ БЛОКА (336-3): типы, шесть вариантов и сборка текста задачи. Здесь нет слов — их выбирает сервер
// (`block-task.i18n.ts`) и передаёт окну пропсом: словарь всех языков в браузер не едет.

export type BlockIntent = "design" | "code" | "broken" | "delete" | "texts" | "tool"
export const INTENTS: BlockIntent[] = ["design", "code", "broken", "delete", "texts", "tool"]

export type BlockTaskUi = {
  title: string
  description: string
  block: string
  copy: string
  copied: string
  details: string
  detailsPlaceholder: string
  send: string
  cancel: string
  pickFirst: string
  keyLink: string
  task: string
  intents: Record<BlockIntent, { title: string; text: string }>
}

/** Текст задачи агенту: вариант, адрес блока, подробности. Одно место — окно и любой будущий потребитель дают одно. */
export function composeBlockTask(ui: BlockTaskUi, intent: BlockIntent, address: string, details: string): string {
  const parts = [`${ui.task}: ${ui.intents[intent].title}`, "", `${ui.block}:`, address.trim()]
  if (details.trim()) parts.push("", `${ui.details}:`, details.trim())
  return parts.join("\n")
}
