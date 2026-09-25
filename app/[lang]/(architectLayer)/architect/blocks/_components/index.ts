import type { Block } from '@/lib/content/blocks/types'
import { servicePortWords } from '@/components/services/service-port.i18n'

// ГЛАВНАЯ ЭЛЕМЕНТА «БЛОКИ» В ЯДРЕ — как у «Авторизации» (слово владельца 2026-09-25: «удалить все страницы которые там
// существуют а вместо этого, также как на вкладка авторизация поставить кнопку Preview и секцию из трёх сервисов Claude
// Code Agent»). Каталог блоков и его витрина живут у самого элемента (`blocks.<зона>`), не в ядре: здесь — его порт
// и публичный адрес, в меню группы — предпросмотр и три страницы агента (комплект `_agent-kit`, папка элемента).
// 🛑 Число порта сюда не пишется: островок спрашивает его у двери `/api/services` (страница предрендерена).
export function content(lang: string): Block[] {
  return [{ kind: 'servicePort', serviceId: 'blocks', words: servicePortWords(lang) }]
}
