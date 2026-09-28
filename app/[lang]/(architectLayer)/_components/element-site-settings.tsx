import { buttonVariants } from '@/components/ui/button'
import type { ElementSettingsUi } from '../_i18n/element-settings.i18n'

// «НАСТРОЙКИ САЙТА» ЭЛЕМЕНТА В МЕНЮ ЯДРА (328, слово владельца 2026-09-28: выпадающий список «Настройки» → опасная зона и
// конфигуратор). Конфигуратор живёт в самом элементе (`/<язык>/admin/site-settings`, выбор «б» 324-8). Ядро не встраивает
// его окном (выбор «б» 2026-09-28): на собственном домене элемента встроенное окно не получило бы билет входа, а в новой
// вкладке на главном адресе вход через центр работает. Здесь — что там настраивается, состояние связи с CONFIG и кнопка.

export function ElementSiteSettings({ lang, ui, siteUrl, configOn }: { lang: string; ui: ElementSettingsUi; siteUrl: string; configOn: boolean }) {
  const w = ui.siteSettings
  const href = `${siteUrl.replace(/\/+$/, '')}/${lang}/admin/site-settings`
  return (
    <section className="my-6 flex flex-col gap-3" data-element-site-settings>
      <p className="text-sm text-foreground">{w.text}</p>
      <p className={configOn ? 'rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground' : 'text-sm text-muted-foreground'} data-config-link={configOn ? 'on' : 'off'}>
        {configOn ? w.configOn : w.configOff}
      </p>
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ className: 'w-fit' })} data-open-site-settings>{w.open}</a>
      <p className="font-mono text-[length:var(--fs-small)] text-muted-foreground">{href}</p>
    </section>
  )
}
