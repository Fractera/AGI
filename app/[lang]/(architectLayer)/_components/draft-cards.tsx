import { StarIcon } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Small } from '@/components/ui/typography'
import type { AgiDraftsUi } from '../_i18n/agi-drafts.i18n'

// ГЛАВНАЯ ГРУППЫ ЧЕРНОВИКА — ДВЕ КАРТОЧКИ, КАК У КОРНЯ (314-1). Слово владельца: «одной страницы которая должна посмотреть как у
// нас выглядит корень каждого субдомена который содержит внутри две карточки с портом и адресом». Вид — `ServicePort` Root
// (289-6): карточки индикатора, крупное значение моноширинным. У черновика порта и поддомена ещё нет («порт пока не выделяй»,
// «мы ещё не генерировали сам субдомен»), поэтому обе карточки в тоне предупреждения с незакрашенной звездой — честное
// «ещё не», а не правдоподобное число.

export function DraftCards({ address, ui }: { address: string; ui: AgiDraftsUi }) {
  return (
    <div className="my-6 flex flex-col gap-3" data-draft-cards>
      <div className="grid gap-3 md:grid-cols-2">
        <Card size="sm" data-active="false" className="bg-destructive/10 ring-destructive/40">
          <CardHeader>
            <CardTitle className="font-semibold">{ui.portTitle}</CardTitle>
            <CardAction>
              <StarIcon role="img" aria-hidden className="size-5 text-destructive" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="font-mono text-5xl font-black tracking-tight text-muted-foreground" aria-hidden>—</p>
            <p className="text-foreground text-sm" data-draft-port-line>{ui.portLine}</p>
          </CardContent>
        </Card>
        <Card size="sm" data-active="false" className="bg-destructive/10 ring-destructive/40">
          <CardHeader>
            <CardTitle className="font-semibold">{ui.addressTitle}</CardTitle>
            <CardAction>
              <StarIcon role="img" aria-hidden className="size-5 text-destructive" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="font-mono text-lg font-bold break-all text-foreground" data-draft-address>{address}</p>
            <p className="text-foreground text-sm">{ui.addressLine}</p>
          </CardContent>
        </Card>
      </div>
      <Small className="text-muted-foreground">{ui.note}</Small>
    </div>
  )
}
