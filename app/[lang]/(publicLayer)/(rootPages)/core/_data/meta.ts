import { meta as home } from '../../../_data/meta'

// Всё непереводимое — как у главной, кроме адреса (261-4).
export const meta = {
  ...home,
  subPath: '/core',
  get ogImage(): string {
    return home.ogImage
  },
}
