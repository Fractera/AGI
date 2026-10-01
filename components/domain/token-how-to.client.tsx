"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import { Small } from "@/components/ui/typography"
import { buttonVariants } from "@/components/ui/button"
import type { DomainLadderWords } from "./domain-ladder.i18n"

// КЛЮЧ CLOUDFLARE ДЛЯ УЗЛА — КАК ЕГО СОЗДАТЬ (259 → 324-1). Одна инструкция на все места, где ключ нужен: шаг 4 лестницы,
// тревога «ключа нет / отозван / истёк», отказ ключа при добавлении домена.
//
// 🔒 ГЛАВНОЕ — ССЫЛКА-ШАБЛОН, А НЕ ТЕКСТ (слово владельца 2026-09-27: «документации не годится … человек не может документацию
// сделать ничего»). Cloudflare поддерживает ссылку, открывающую форму токена с уже проставленными правами (документация «API
// token template URLs»: `dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=…&accountId=*&zoneId=all&name=…`, права —
// URL-кодированный JSON `[{key, type}]`). Ключи `zone` и `dns` — из таблицы той же страницы. Ключа права Cloudflare Tunnel в
// таблице документации нет (перепроверено 2026-10-01), но он есть у самой формы: `argotunnel` — замерено формой Cloudflare в
// браузере владельца 2026-10-01 (ссылка с ним дала строку Account · Cloudflare Tunnel · Edit, скрытое значение `argotunnel`).
// ✗ До этого строку человек добавлял руками — и 30.09 ключ ушёл без неё (361).
// Ручная пошаговая инструкция остаётся свёрнутой — на случай, если форма не заполнилась.

// 344-1: `workers_scripts` и `workers_routes` — копия публичных страниц в Workers аккаунта человека (ключи — из той же таблицы
// «API token template URLs», проверено 2026-09-30).
const TEMPLATE_PERMISSIONS = [
  { key: "zone", type: "edit" }, { key: "dns", type: "edit" }, { key: "argotunnel", type: "edit" },
  { key: "workers_scripts", type: "edit" }, { key: "workers_routes", type: "edit" },
]

export const TOKEN_TEMPLATE_URL =
  "https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=" + encodeURIComponent(JSON.stringify(TEMPLATE_PERMISSIONS)) +
  "&accountId=" + encodeURIComponent("*") + "&zoneId=all&name=" + encodeURIComponent("Fractera node")

type Words = Pick<DomainLadderWords,
  "tokenTemplateButton" | "tokenTemplateSteps" | "tokenManualToggle" |
  "tokenHowSteps" | "tokenPermsTitle" | "tokenPermsHead" | "tokenPermsRows" | "tokenPermsWhy" | "tokenTail">

export function TokenHowTo({ words }: { words: Words }) {
  const [manual, setManual] = useState(false)
  return (
    <div className="flex flex-col gap-2" data-token-how>
      <a className={`${buttonVariants({ size: "sm" })} w-fit gap-1.5`} href={TOKEN_TEMPLATE_URL} target="_blank" rel="noopener noreferrer" data-token-template>
        {words.tokenTemplateButton}
        <ExternalLink className="size-4" aria-hidden />
      </a>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">
        {words.tokenTemplateSteps.map((line) => <li key={line}>{line}</li>)}
      </ol>
      <div className="rounded-md border border-border bg-muted/40 p-3">
        <button aria-expanded={manual} className="flex w-full items-center justify-between gap-2 text-left" onClick={() => setManual((v) => !v)} type="button">
          <Small className="font-semibold text-foreground">{words.tokenManualToggle}</Small>
          <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${manual ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {manual ? (
          <>
            <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">
              {words.tokenHowSteps.map((line) => <li key={line}>{line}</li>)}
            </ol>
            <Small className="mt-3 block font-semibold text-foreground">{words.tokenPermsTitle}</Small>
            {/* 🛑 Таблица в своей прокрутке: на телефоне три столбца шире экрана, а страница целиком горизонтально ездить не должна. */}
            <div className="mt-1 overflow-x-auto">
              <table className="w-full min-w-[20rem] border-collapse text-sm">
                <thead>
                  <tr>
                    {words.tokenPermsHead.map((h) => (
                      <th className="border border-border bg-muted px-2 py-1 text-left font-semibold" key={h} scope="col">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {words.tokenPermsRows.map((row) => (
                    <tr key={row.join("-")}>
                      {row.map((cell) => <td className="border border-border px-2 py-1 font-mono" key={cell}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground text-sm">
              {words.tokenPermsWhy.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-foreground text-sm">
              {words.tokenTail.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  )
}
