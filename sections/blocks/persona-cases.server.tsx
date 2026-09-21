import type { SectionRenderer } from '@/sections/contract'
import { inline } from '@/lib/content/blocks/inline'
import { H3, H4, P, Small } from '@/components/ui/typography'
import { SectionHead } from '@/sections/section-head.server'

// ЛИЧНОСТИ И ИХ КЕЙСЫ: одна сделка, рассказанная трижды — глазами каждого участника.
//
// 🎯 ЗАКАЗ ВЛАДЕЛЬЦА 2026-09-21, дословно: «вверху сделать сортировку — то есть мы можем
// просматривать либо кейс Маши, либо кейс Васи, либо кейс Пети… карточку личности можешь
// представить в верхней части как блок с радиусом 50%: в левой части круглая аватар-иконка,
// в правой имя и роль. Эта кнопка при нажатии становится подсвеченной, меняется background,
// появляется свечение. Под переключателем меняется контейнер, и в этом контейнере находится
// шесть кейсов». Он же назвал причину, по которой вид вообще заведён: шестишаговая лента
// «перегружена дизайном», а `flow` — «конкретно для трёх шагов».
//
// 🔒 ПЕРЕКЛЮЧЕНИЕ — РАДИОКНОПКИ И CSS, НИ ОДНОЙ СТРОКИ СКРИПТА. Канон проекта, записанный
// у карусели: «показать один из нескольких блоков умеет чистый CSS». Отсюда два следствия,
// ради которых это и выбрано: все восемнадцать кейсов лежат в разметке — их читает поисковик
// и человек с выключенным JavaScript, — а переключение работает без гидратации. Островок дал
// бы обратное: текст уехал бы в браузер, а без скрипта секция осталась бы пустой.
//
// 🔒 ПЕРЕКЛЮЧАТЕЛИ СТОЯТ ПЕРЕД СОДЕРЖИМЫМ, потому что правило `:checked ~` смотрит только
// вперёд по соседям. Они видимы клавиатуре и скрыты для глаза: выбор несут ярлыки-карточки.
// Правила живут в `styles/globals.css` (`.pc-*`): связь «переключатель → ярлык → контейнер»
// принадлежит отношению между элементами, и утилитой на элементе её не выразить.
//
// 🔒 НОМЕР КЕЙСА — ЗНАЧОК, А НЕ ЗАГОЛОВОК. Порядок несёт сам список (`<ol>`), и читалка
// произносит «1 из 6» без нашей помощи; кружок с цифрой скрыт от озвучивания.

export const personaCases: SectionRenderer<'personaCases'> = (b, { key: k }) => (
  <section key={k} aria-labelledby={`${k}-t`} className="my-10">
    <SectionHead
      id={`${k}-t`}
      badge={b.badge}
      title={b.title}
      note={b.note ? inline(b.note, `${k}-n`) : undefined}
    />

    <div className="pc mt-8">
      {b.personas.map((p, i) => (
        <input
          key={`${k}-r${i}`}
          className="pc-r sr-only"
          type="radio"
          name={k}
          id={`${k}-r${i}`}
          defaultChecked={i === 0}
        />
      ))}

      <div className="pc-body flex flex-col gap-6">
        {/* Ряд личностей: ярлык — настоящий `<label>`, поэтому нажатие и клавиатура
            переключают выбор без нашей помощи. Радиус 50% — заказ владельца. */}
        <ul className="flex list-none flex-wrap gap-3 p-0">
          {b.personas.map((p, i) => (
            <li key={`${k}-l${i}`}>
              <label
                htmlFor={`${k}-r${i}`}
                className="pc-tab flex cursor-pointer items-center gap-3 rounded-full border py-2 pr-5 pl-2 transition-all"
              >
                {/* 🔒 ПОРТРЕТ — ФАЙЛ ИЗ `public/personas/`, И ЭТО РЕШЕНИЕ, А НЕ МЕЛОЧЬ.
                    Заменить лицо фотографией или сгенерированным портретом можно, положив
                    другой файл: код и тип об этом не знают. Значок, нарисованный в секции,
                    такой замены не допускал — владелец назвал его отвратительным, и был прав.
                    Картинка ДЕКОРАТИВНА (`alt=""`): имя и роль стоят рядом словами, и читалка
                    экрана не должна произносить их дважды. Обычный `<img>`, а не оптимизатор:
                    это SVG, и оптимизировать в нём нечего. */}
                <img alt="" className="size-11 shrink-0 rounded-full border border-border bg-muted object-cover" height={44} src={p.avatar} width={44} />
                <span className="flex flex-col">
                  <H4 variant="ui" className="leading-tight">{p.name}</H4>
                  <Small className="text-muted-foreground">{p.role}</Small>
                </span>
              </label>
            </li>
          ))}
        </ul>

        {/* Контейнеры сложены в одну ячейку сетки: невыбранные не занимают места и не
            ловят курсор, но высоту секции задаёт самый длинный — при переключении
            страница не дёргается. Тот же приём, что у вида `problemSolution`. */}
        <div className="grid">
          {b.personas.map((p, i) => (
            <div key={`${k}-p${i}`} className="pc-panel col-start-1 row-start-1">
              <ol className="pc-cases relative m-0 grid list-none gap-4 p-0 md:grid-cols-2">
                {p.cases.map((c, ci) => (
                  <li key={`${k}-${i}-${ci}`} className="flex gap-4">
                    <span
                      aria-hidden
                      className="pc-node flex size-9 shrink-0 items-center justify-center rounded-full border font-semibold"
                    >
                      {ci + 1}
                    </span>
                    <div className="pc-card w-full rounded-2xl border border-border bg-card p-5">
                      <H3 className="text-[length:var(--fs-h4)]">{c.title}</H3>
                      <P className="mt-2">{inline(c.text, `${k}-${i}-${ci}-b`)}</P>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)
