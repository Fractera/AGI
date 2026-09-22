import "server-only";

import { flowDone, flowVerified, flowPushed, flowMarked } from "../../server/launch-flow";
import { stepOneStrings, stepTwoStrings, DEFAULT_TEMPLATE_BUILT } from "./_strings";
import { stepThreeStrings } from "./_step3";
import { stepFourStrings } from "./_step4";

// ЕДИНСТВЕННОЕ ПЕРЕЧИСЛЕНИЕ ШАГОВ ПУТИ (28-13, 2026-08-31).
//
// 🔒 ОДИН СПИСОК, А НЕ ДВА. Карта пути, счётчик «шаг N из 11» и защита от прыжка
// вперёд обязаны читать ОДНО перечисление. Два списка расходятся на третьей
// правке, и карта начинает показывать шаги, которых нет, — а человек меряет по
// ней, сколько сил осталось потратить.
//
// 🔒 ЗАГОЛОВКИ НЕ ПЕРЕПИСЫВАЮТСЯ ЗДЕСЬ, А БЕРУТСЯ У САМИХ ШАГОВ. Слова шага
// живут в его файле (`_stepN.ts`), и вторая копия названия разошлась бы с первой
// молча: на странице одно имя, в карте другое, и оба выглядят правильными.
//
// 🔒 «ЗАВЕРШЁН» ВЫВОДИТСЯ ИЗ ФАКТА, А НЕ ХРАНИТСЯ ОТДЕЛЬНО. Тот же закон, что в
// `launch-flow.ts`: у каждого шага свой источник правды — сохранённое значение,
// ответ GitHub, отметка человека. Второй ключ «пройдено» рядом с ними стал бы
// вторым источником правды, и через неделю они разошлись бы.
// ✗ оплачено шагом 25: отметка одного шага была заимствована у другого, и мастер
// поздравлял человека с тем, чего он не делал.

export type PathStep = {
  /** Номер шага, каким его видит человек. */
  n: number;
  /** Адрес относительно корня пути. */
  slug: string;
  /** Заголовок — из файла самого шага. */
  title: string;
  /** Закрыт ли шаг. Выводится из факта, названного в комментарии рядом. */
  done: boolean;
};

export function pathSteps(lang: string): PathStep[] {
  const all: PathStep[] = [
    // 1–2: сохранённое значение. 3: ответ GitHub. 4: коммит на удалённой `main`.
    { n: 1, slug: "step-1", title: stepOneStrings(lang).title, done: flowDone("repo-url") },
    { n: 2, slug: "step-2", title: stepTwoStrings(lang).title, done: flowDone("token") },
    { n: 3, slug: "step-3", title: stepThreeStrings(lang).title, done: flowVerified() },
    { n: 4, slug: "step-4", title: stepFourStrings(lang).title, done: flowPushed() },
  ];

  // 🔒 КАРТА ПОКАЗЫВАЕТ ТО, ЧТО ПОСТРОЕНО, А НЕ ТО, ЧТО ЗАДУМАНО. Ссылка на
  // несуществующий шаг ведёт в 404 — этим уже оплачена шкала прогресса (28-11).
  return all.slice(0, DEFAULT_TEMPLATE_BUILT);
}

/**
 * Первый незакрытый шаг — тот, на котором человек стоит.
 *
 * Возвращает `null`, когда закрыты все построенные: тогда возвращаться некуда, и
 * предлагать «продолжить» нечестно.
 */
export function currentStep(steps: PathStep[]): PathStep | null {
  return steps.find(s => !s.done) ?? null;
}

/**
 * Открыт ли шаг.
 *
 * 🔒 ПРАВИЛО ОДНО: шаг открыт, если закрыты все предыдущие. Пройденный шаг
 * остаётся открытым — вернуться и заменить значение человек вправе (28-18), и
 * запертая дорога назад превратила бы путь в допрос.
 */
export function stepOpen(steps: PathStep[], n: number): boolean {
  return steps.filter(s => s.n < n).every(s => s.done);
}
