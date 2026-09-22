import type { ReactNode } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Small } from '@/components/ui/typography'
import { GithubBinding } from './client/github-binding.client'
import { githubWords } from './words/github.i18n'
import { adminHref } from '../_connect/shell/admin-nav'

// ВХОД СТРАНИЦЫ В СВОЙ ОСТРОВОК (273, кнопка мастера — 274-4).
//
// 🔒 ЯЗЫК ВЫБИРАЕТСЯ ЗДЕСЬ, НА СЕРВЕРЕ, и в островок уходит один набор строк — словарь не едет в браузер.
// 🔒 ВЕЩЬ ЖИВЁТ В ПАПКЕ СВОЕГО МАРШРУТА (закон 271): удалили вкладку — ушли островок, слова и двери.
//
// 🔒 КНОПКА — ОБЫЧНАЯ ССЫЛКА, А НЕ ПЕРЕКЛЮЧАТЕЛЬ СОСТОЯНИЯ. Мастер подключения живёт по собственным
// адресам (`…/github/connect/step-1…4`), поэтому экран сменяется переходом: страницу можно
// предрендерить, дать ссылкой и вернуться на неё. Переключатель внутри страницы увёл бы вкладку в
// динамику и лишил бы каждый шаг адреса — закон о разделе экрана как маршруте.
//
// 🔒 КНОПКА ГОРИТ ВСЕГДА. Решение владельца 2026-09-22: репозиторий подключают и повторно — «будет
// гореть кнопка, если пользователь вновь захочет подключить другой репозиторий». Прятать её, когда
// привязка уже есть, значило бы объявить первое подключение единственным.
export function githubWidget(lang: string): ReactNode {
  const words = githubWords(lang)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Link
          href={`${adminHref(lang, 'project-start')}/step-1`}
          className={`${buttonVariants({ variant: 'default' })} self-start`}
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          {words.connectCta}
        </Link>
        <Small>{words.connectHint}</Small>
      </div>
      <GithubBinding lang={lang} words={words} />
    </div>
  )
}
