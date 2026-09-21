import type { Block } from '@/lib/content/blocks/types'
import { resendSetupWords } from '@/components/auth/resend-setup.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Sign-in letter (Resend)» (266-2).
//
// 🔒 ЗДЕСЬ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА СТРАНИЦЫ. Экран включения —
// переиспользуемая часть со своим словарём рядом с собой, как у соседнего раздела
// «Вход через Google»: оба стоят на одних ступенях (`setup-ladder.client.tsx`).
//
// 🔒 ЯЗЫК ВЫБИРАЕТСЯ ЗДЕСЬ, НА СЕРВЕРЕ, И В БЛОК УХОДИТ ОДИН НАБОР СТРОК — иначе
// словарь уехал бы в браузер целиком, и это поймал бы `check:lang-delivery`.
//
// 🔒 ЭКРАН СТОИТ ПЕРЕД ТЕКСТОМ: оболочка складывает «работающая часть, потом
// темы» — человек приходит сюда действовать, текст объясняет то, что он видит.
export function content(lang: string): Block[] {
  return [{ kind: 'authResendSetup', words: resendSetupWords(lang) }]
}
