import type { ElementSettingsUi } from '../_i18n/element-settings.i18n'

// 446-3 (слово владельца 2026-10-11): ТРЕТЬЯ, ОРАНЖЕВАЯ, ЧИСТО ИНФОРМАЦИОННАЯ КАРТОЧКА «Вход на собственном домене» — только когда у
// элемента подключён свой домен. Дословно: «расскажешь о том что архитектура проекта такая что вход на ваш новый домен будет работать
// … Почему это сделано … Если вы хотите чтобы вход был через ваш собственный домен … вам придётся повторить подключение всех провайдеров
// … переработать следующие файлы … Текущая версия не поддерживает автоматическое решение … Не рекомендуется». Довод владельца: он трижды
// принимал устройство входа за поломку. Адреса — настоящие: свой домен элемента и центр входа узла (`auth.<зона узла>`).
// Устройство — шаг 328 (одноразовый код центра); почему не «вход по пути сайта» — отчёт
// `reports/errors-element-own-domain-sign-in-jumps-to-missing-auth-host-and-leaked-core-env.md` (в /code).

export function ElementOwnDomainSignIn({ ui, domain, center }: { ui: ElementSettingsUi; domain: string; center: string }) {
  const w = ui.signInCard
  const fill = (s: string) => s.replaceAll('{domain}', domain).replaceAll('{center}', center)
  return (
    <div className="flex flex-col gap-3 text-sm text-foreground" data-own-domain-signin={domain}>
      <div>
        <p className="font-medium">{w.howTitle}</p>
        <p>{fill(w.how)}</p>
      </div>
      <div>
        <p className="font-medium">{w.whyTitle}</p>
        <p>{fill(w.why)}</p>
      </div>
      <div>
        <p className="font-medium">{fill(w.ownTitle)}</p>
        <p>{fill(w.own)}</p>
        <ul className="mt-1 list-disc pl-5">
          {w.files.map((f) => (
            <li key={f.path}><code className="text-[length:var(--fs-small)]">{f.path}</code> — {f.what}</li>
          ))}
        </ul>
      </div>
      <p className="font-medium">{w.notSupported}</p>
    </div>
  )
}
