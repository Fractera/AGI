// ШАГ ЧЕТВЁРТЫЙ ПУТИ «СТАРТОВЫЙ ШАБЛОН»: ОТПРАВИТЬ ПРОЕКТ (28-21, 2026-08-27).
//
// 🔒 ЭТО ПОСЛЕДНИЙ ИЗ ЧЕТЫРЁХ, НА КОТОРЫЕ ВЛАДЕЛЕЦ ВЕЛЕЛ РАЗДЕЛИТЬ «ШАГ 1 ИЗ 13»:
// адрес · токен · проверка · отправка. Живой мастер требует все четыре внутри
// одного шага; здесь их четыре, и счётчик считает честно.
//
// 🔒 ЕДИНСТВЕННОЕ ДЕЙСТВИЕ ПУТИ, МЕНЯЮЩЕЕ ЧТО-ТО ВНЕ ПАНЕЛИ. Три предыдущих шага
// писали в своё состояние и спрашивали GitHub; этот кладёт файлы в чужой
// репозиторий. Отсюда главная мысль страницы, взятая у владельца дословно:
// «подключение данных не перемещает ни одного файла — перемещает отправка».
//
// 🔒 ОТМЕТКА ОТПРАВКИ НЕ ГАСНЕТ ПРИ СМЕНЕ ТОКЕНА, в отличие от отметки проверки.
// Проверка утверждает про нынешние данные, отправка — про случившееся событие:
// файлы уехали, и новый токен этого не отменяет.

import { getAdminStrings } from "../../../shell/admin-strings";
import { adminHref, connectApi, githubHref } from "../../../shell/admin-nav";
import { PageShell } from "../../../shell/page-shell";
import { StepSection } from "../../../ui/step-section";
import { pathSteps, stepOpen, currentStep } from "../_steps";
import { pathMapStrings } from "../_strings";
import { StepLocked } from "../../../ui/step-locked";
import { VerifyStep } from "../../../ui/verify-step.client";
import { StepNav } from "../../../ui/step-nav";
import { Small } from "@/components/ui/typography";
import { Check } from "lucide-react";
import { flowPushed, flowPushedAt, flowValue } from "../../../server/launch-flow";
import { DEFAULT_TEMPLATE_TOTAL, DEFAULT_TEMPLATE_BUILT } from "../_strings";
import { stepFourStrings } from "../_step4";

export const dynamic = "force-dynamic";

export default async function DefaultTemplateStepFour(
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  const s = getAdminStrings(lang);
  const x = stepFourStrings(lang);

  // 🔒 ЗАЩИТА ОТ ПРЫЖКА ВПЕРЁД (28-13). Открыт шаг, у которого закрыты все
  // предыдущие. Пройденный шаг остаётся открытым: вернуться и заменить значение
  // человек вправе (28-18), и запертая дорога назад превратила бы путь в допрос.
  const flowSteps = pathSteps(lang);
  if (!stepOpen(flowSteps, 4)) {
    const back = currentStep(flowSteps);
    const m = pathMapStrings(lang);
    const backN = back ? back.n : 1;
    return (
      <PageShell
        lang={lang}
        slug="project-start"
        s={s}
        tail={[
          { label: "default-template", href: `${adminHref(lang, "project-start")}` },
          { label: "step-4" },
        ]}
        title={x.pageTitle}
        hint={x.pageHint}
      >
        <StepLocked
          title={x.title}
          message={m.lockedMessage.replace("{n}", String(backN))}
          backHref={`${adminHref(lang, "project-start")}/step-${backN}`}
          backLabel={m.lockedBack.replace("{n}", String(backN))}
        />
      </PageShell>
    );
  }
  const pushed = flowPushed();
  const pushedAt = flowPushedAt();
  const repoUrl = flowValue("repo-url");

  return (
    <PageShell
      lang={lang}
      slug="project-start"
      s={s}
      tail={[
        { label: "default-template", href: `${adminHref(lang, "project-start")}` },
        { label: "step-4" },
      ]}
      title={x.pageTitle}
      hint={x.pageHint}
    >
      <StepSection
        index={4}
        total={DEFAULT_TEMPLATE_TOTAL}
        stepOfTemplate={x.stepOf}
        doneLabel={x.done}
        done={pushed}
        badge={x.badge}
        title={x.title}
        lead={x.lead}
        info={x.info}
        important={x.important}
        actionLead={x.actionLead}
        bullets={x.bullets}
        stepHref={(n) =>
          n <= DEFAULT_TEMPLATE_BUILT
            ? `${adminHref(lang, "project-start")}/step-${n}`
            : undefined
        }
        // 🔒 ССЫЛКА ВЕДЁТ НА РЕПОЗИТОРИЙ ЧЕЛОВЕКА, А НЕ НА ФОРМУ GITHUB, и это
        // единственное место пути, где так. На шагах 1 и 2 ссылка отвечала на
        // вопрос «куда идти делать»; здесь — на вопрос «как убедиться, что
        // получилось». Владелец назвал это прямо: «личный способ для того, чтобы
        // пользователь мог проверить, добрался ли новый код до его репозитория».
        //
        // 🔒 АДРЕС БЕРЁТСЯ ИЗ СОХРАНЁННОГО ЗНАЧЕНИЯ ПЕРВОГО ШАГА. Собрать его
        // заново из чего-либо ещё значило бы завести второй источник правды об
        // одном факте; нет сохранённого адреса — нет и ссылки, а не ссылка в
        // никуда.
        //
        // Открывается в новой вкладке (это делает `StepLink`): уйдя из панели в
        // том же окне, человек теряет шаг и возвращается кнопкой «назад», если
        // догадается.
        link={repoUrl ? { href: repoUrl, label: x.linkLabel } : undefined}
      >
        <div className="flex flex-col gap-5">
          {pushed && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.06] px-3.5 py-2.5">
              <Check size={16} aria-hidden className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <Small className="text-emerald-700 dark:text-emerald-300">
                {x.pushedAt} {new Date(pushedAt).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB")}
              </Small>
            </div>
          )}

          {pushed ? (
            // 🔒 ПОСЛЕДНИЙ ШАГ ВЫВОДИТ ИЗ МАСТЕРА (274-4). Прежде здесь не было кнопки «вперёд»:
            // в панели путь продолжался пятым шагом. Здесь продолжения нет — есть возвращение на
            // вкладку, ради которой репозиторий и подключали. Тупик в конце процесса человек
            // читает как поломку, а не как окончание.
            <StepNav
              prevHref={`${adminHref(lang, "project-start")}/step-3`}
              nextHref={githubHref(lang)}
              labels={{ goPrev: x.goPrev, goNext: x.goDone }}
            />
          ) : (
            <VerifyStep
              endpoint={`${connectApi(lang)}/push`}
              labels={{
                cta: x.cta,
                busy: x.busy,
                successTitle: x.successTitle,
                successHint: x.successHint,
                failureTitle: x.failureTitle,
                reasons: x.reasons,
                reasonUnknown: x.reasonUnknown,
              }}
            />
          )}
        </div>
      </StepSection>
    </PageShell>
  );
}
