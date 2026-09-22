import type { ReactNode } from 'react'
import { GithubBinding } from './client/github-binding.client'
import { githubWords } from './words/github.i18n'

// ВХОД СТРАНИЦЫ В СВОЙ ОСТРОВОК (273).
//
// 🔒 ЯЗЫК ВЫБИРАЕТСЯ ЗДЕСЬ, НА СЕРВЕРЕ, и в островок уходит один набор строк — словарь не едет в браузер.
// 🔒 ВЕЩЬ ЖИВЁТ В ПАПКЕ СВОЕГО МАРШРУТА (закон 271): удалили вкладку — ушли островок, слова и двери.
export function githubWidget(lang: string): ReactNode {
  return <GithubBinding lang={lang} words={githubWords(lang)} />
}
