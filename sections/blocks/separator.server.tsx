import type { SectionRenderer } from '@/sections/contract'
import { Separator } from '@/components/ui/separator'

// ГОРИЗОНТАЛЬНЫЙ РАЗДЕЛИТЕЛЬ (296). Слово владельца 2026-09-25: «в блоках добавил горизонтальный разделитель, так как
// сейчас не видно границ блоков». Вид, а не вёрстка: разделитель ставится в список блоков страницы, как любой другой.
export const separator: SectionRenderer<'separator'> = (_b, { key: k }) => <Separator key={k} className="my-8" />
