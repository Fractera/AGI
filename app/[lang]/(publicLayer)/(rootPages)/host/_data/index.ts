import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'
import type { FooterPageData } from '@/lib/pages/footer-page'

// Компактный лендинг развёртывания на выделенном сервере (261-7). Формы здесь нет намеренно —
// слово владельца: «мы не будем устанавливать форму развёртывания у нас для этого внутри есть
// страница туда дело переадресацию». Кнопка ведёт на «Активацию хостинга» слоя архитектора.
export const data: FooterPageData = { meta, en, overrides: { ru } }
