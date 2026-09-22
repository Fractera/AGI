import type { SectionRenderer } from '@/sections/contract'
import { AgentTerminal } from '@/components/terminal/agent-terminal.client'

// Терминал агента узла (267-1).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ — как `authResendSetup`: работающая часть
// входит на страницу своим видом каталога, иначе всё, что читает `SECTIONS.json`,
// о ней бы не знало.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ: рисовальщик серверный, словарь остаётся на сервере.
export const agentTerminal: SectionRenderer<'agentTerminal'> = (b, { key: k }) => (
  <AgentTerminal key={k} service={b.service} words={b.words} />
)
