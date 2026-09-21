import type { SectionRenderer } from '@/sections/contract'
import { ServicePort } from '@/components/services/service-port.client'

// Порт сменного блока, спрошенный у узла (264-1).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ. Страницы коллекции собираются из блоков
// каталога; работающая часть входит туда своим видом, как `chat`, `voiceField`
// или `domainLadder`. Вставь мы островок мимо каталога — появился бы второй
// способ класть на страницу живое, и всё, что читает `SECTIONS.json`, о нём бы
// не знало.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ, А НЕ БЕРУТСЯ ЗДЕСЬ: рисовальщик серверный, язык
// известен странице, и словарь остаётся на сервере целиком.
export const servicePort: SectionRenderer<'servicePort'> = (b, { key: k }) => (
  <ServicePort key={k} serviceId={b.serviceId} words={b.words} />
)
