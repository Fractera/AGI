import "server-only"
import { listVars } from "@/lib/env-file"
import { appDialogUi } from "@/components/dialog/app-dialog.i18n"
import { environmentUi } from "./environment.i18n"
import { EnvironmentPanel as Panel } from "./environment-panel.client"

// СЕРВЕРНАЯ ПОЛОВИНА ВКЛАДКИ (336-1): список переменных и пояснения — из файла-примера цели (`core` или id элемента).
// Состояние «задана / не задана» остров спрашивает сам.
export function EnvironmentPanel({ target, lang }: { target: string; lang: string }) {
  return <Panel target={target} rows={listVars(target)} ui={environmentUi(lang)} dialogUi={appDialogUi(lang)} />
}
