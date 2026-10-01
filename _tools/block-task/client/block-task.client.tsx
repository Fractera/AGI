"use client"

import { useEffect, useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import { VoiceControl } from "@/components/form/voice-control.client"
import { INTENTS, composeBlockTask, composeNote, type BlockIntent, type BlockTaskUi } from "../types/block-task"

// ОКНО ЗАДАЧИ БЛОКА (инструмент, 336-3). Слово владельца 2026-09-29: «Нажми для обновления» → окно с вариантами «улучшить
// дизайн · улучшить код · это работает неправильно · давай это удалим · давай изменим тексты · давай превратим это в
// инструмент»; у варианта раскрывается описание; подробности — голосом.
//
// 🔒 ИНСТРУМЕНТ НЕ ЗНАЕТ, КУДА УЙДЁТ ЗАДАЧА. Он собирает текст (`composeBlockTask`: вариант + адрес + подробности) и отдаёт
// его `onSend`; первый потребитель — Preview ядра, который кладёт текст в окно вставки терминала элемента. В сеть инструмент
// ходит только за расшифровкой голоса (`voiceApiUrl`, дверь ядра `/api/transcribe`).
// 🔒 ВЫБОР = РАСКРЫТЫЙ ВАРИАНТ: аккордеон на один пункт; открыт — значит выбран, «Отправить» ждёт выбора.
// 🔒 РЕЖИМ «ЗАМЕТКА» (`note`, шаг 356-3 — причина отклонения предпросмотра): вариантов нет, `address` — готовая строка задачи,
// подробности необязательны; «Отправить» доступно сразу, `onSend` получает текст и сами подробности (пустые — решает потребитель).

export function BlockTask({
  open,
  onOpenChange,
  address,
  lang,
  ui,
  dialogUi,
  voiceApiUrl,
  keyHref,
  note = false,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Адрес блока «страница · файл · блок · ссылка» — как его прислала подсветка элемента. */
  address: string
  lang: string
  ui: BlockTaskUi
  dialogUi: AppDialogUi
  voiceApiUrl?: string
  /** Поле ключа OpenAI — туда ведёт подсказка голосового ввода, когда ключа нет (новая вкладка). */
  keyHref?: string
  /** 356-3: окно без вариантов — строка `address` плюс подробности. */
  note?: boolean
  onSend: (text: string, details: string) => void
}) {
  const [intent, setIntent] = useState<BlockIntent | "">("")
  const [details, setDetails] = useState("")
  const [copied, setCopied] = useState(false)

  // Новый блок — чистое окно: задача прошлого блока не должна уехать с чужим адресом.
  useEffect(() => { setIntent(""); setDetails(""); setCopied(false) }, [address])

  async function copy() {
    try { await navigator.clipboard.writeText(address); setCopied(true) } catch { setCopied(false) }
  }

  function send() {
    if (note) onSend(composeNote(ui, address, details), details.trim())
    else if (intent) onSend(composeBlockTask(ui, intent, address, details), details.trim())
    else return
    setIntent("")
    setDetails("")
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ui.title}
      description={ui.description}
      ui={dialogUi}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{ui.cancel}</Button>
          <Button type="button" onClick={send} disabled={!note && !intent} data-block-task-send>{ui.send}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4" data-block-task>
        <div className="flex flex-col gap-1.5">
          <Small className="font-medium">{ui.block}</Small>
          <pre className="whitespace-pre-wrap break-all rounded-md border border-border p-2 font-mono text-xs select-all">{address}</pre>
          {!note && (
            <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={copy}>
              <Copy className="size-4" aria-hidden />
              {copied ? ui.copied : ui.copy}
            </Button>
          )}
        </div>
        {!note && (
          <Accordion type="single" collapsible value={intent} onValueChange={(v) => setIntent(v as BlockIntent | "")} className="rounded-md border border-border px-3">
            {INTENTS.map((id) => (
              <AccordionItem key={id} value={id} data-block-intent={id}>
                <AccordionTrigger>{ui.intents[id].title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{ui.intents[id].text}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <div className="flex flex-col gap-1.5">
          <Small className="font-medium" id="block-task-details-label">{ui.details}</Small>
          <VoiceControl
            id="block-task-details"
            variant="textarea"
            rows={4}
            value={details}
            onChange={setDetails}
            lang={lang}
            placeholder={ui.detailsPlaceholder}
            labelledBy="block-task-details-label"
            apiUrl={voiceApiUrl}
            keyHint={keyHref ? { href: keyHref, label: ui.keyLink } : undefined}
          />
        </div>
        {!note && !intent && <Small className="text-muted-foreground">{ui.pickFirst}</Small>}
      </div>
    </AppDialog>
  )
}
