import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ElementSettingsUi } from '../_i18n/element-settings.i18n'

// РАЗДЕЛ «НАСТРОЙКИ» — DANGER ZONE AGI ЭЛЕМЕНТА (325). Слово владельца 2026-09-27: «обязательной страницы которые называется
// настройка. Так называемый Danger zone»: описание в ядре, адрес, главное зеркало, удаление. Четыре карточки в одном месте.
//
// 🔒 КАРТОЧКА БЕЗ ПОСТРОЕННОГО ДЕЙСТВИЯ — С НЕАКТИВНОЙ КНОПКОЙ И ПОЯСНЕНИЕМ, КОГДА ОНО ПОЯВИТСЯ (как откат, 321): видно, что
// будет здесь, и нет кнопки, обещающей несделанное. Построенный подшаг передаёт своё действие через `actions`.
// Удаление — в тоне предупреждения: это единственное необратимое действие страницы.

// 324-7: три связи с узлом (CONFIG, Дизайн, Блоки) — по карточке на связь, перед удалением.
type Key = 'describe' | 'address' | 'mirror' | 'config' | 'design' | 'blocks' | 'remove'

export function ElementDangerZone({ ui, actions = {} }: { ui: ElementSettingsUi; actions?: Partial<Record<Key, ReactNode>> }) {
  const cards: Key[] = ['describe', 'address', 'mirror', 'config', 'design', 'blocks', 'remove']
  return (
    <section className="my-6 flex flex-col gap-3" data-element-danger-zone aria-label={ui.badge}>
      <span className="w-fit rounded-md border border-destructive/40 px-2 py-0.5 text-[length:var(--fs-small)] font-medium text-destructive">
        {ui.badge}
      </span>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((key) => {
          const c = ui[key]
          const danger = key === 'remove'
          return (
            <Card key={key} size="sm" className={danger ? 'bg-destructive/5 ring-destructive/40' : undefined} data-danger-card={key}>
              <CardHeader>
                <CardTitle className={danger ? 'font-semibold text-destructive' : 'font-semibold'}>{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-foreground">{c.text}</p>
                {actions[key] ?? (
                  <div className="flex flex-col gap-1.5" data-danger-pending={key}>
                    <Button type="button" variant={danger ? 'destructive' : 'outline'} size="sm" className="w-fit" disabled aria-disabled="true">
                      {c.action}
                    </Button>
                    <p className="text-sm text-muted-foreground">{c.pending}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
