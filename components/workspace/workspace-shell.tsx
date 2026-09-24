import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { H3, H4, P, Small } from '@/components/ui/typography'
import { TabsScroll } from '@/components/workspace/tabs-scroll.client'
import { MenuScrollKeep } from '@/components/workspace/menu-scroll-keep.client'
import { MenuIcon } from '@/components/workspace/menu-icons'

// РАСКЛАДКА РАБОЧЕГО ЭКРАНА — ОДНА НА БЛОК И НА СТРАНИЦЫ (шаг 49, 2026-08-30).
//
// 🔒 ЗАЧЕМ ОТДЕЛЬНЫЙ КОМПОНЕНТ, ЕСЛИ ВИД `workspace` УЖЕ ЕСТЬ. Вид принимает
// содержимое как `children: Block[]` — материал каталога. Страницы слоя
// архитектора содержат ОСТРОВКИ: редакторы полей, переключатели, загрузку
// картинок. Островок в блок не завернуть — он не материал, а работающая вещь.
//
// Значит у одной раскладки два потребителя с разной природой содержимого. Общий
// компонент принимает `ReactNode` — и блок, и страница дают ему своё:
//   • `sections/blocks/workspace.server.tsx` → отрисованные блоки материала;
//   • страницы слоя → островки.
//
// 🔒 ЭТО НЕ ТРАНСФОРМАЦИЯ ВИДА ПОД СТРАНИЦУ, И РАЗНИЦА ПРОВЕРЯЕМА. Вид не узнал
// о существовании страниц: он по-прежнему получает блоки и по-прежнему ничего не
// знает о слое архитектора. Общей стала РАСКЛАДКА — то, что и так было одним и
// тем же; разошлись бы две её копии на первой правке отступа.
//
// 🔒 БЕЗ `"use client"`. Ящик открывается переключателем и правилом CSS, поэтому
// работает при выключенном JavaScript. Островки приходят снаружи, в `children`, и
// клиентскими становятся сами по себе — раскладке для этого меняться не нужно.

export type WorkspaceShellItem = {
  label: string
  /** Значок слева от подписи (288-2) — имя из `menu-icons.tsx`. */
  icon?: string
  href?: string
  active?: boolean
  /** Разделы пункта — раскрывающееся подменю. Закон и цена — у поля `children` вида `workspace`. */
  children?: WorkspaceShellItem[]
  /** Подменю раскрыто. Отдельно от `active` — см. закон у поля `open` вида `workspace`. */
  open?: boolean
}
export type WorkspaceShellNote = {
  tone: 'recommended' | 'advice' | 'warning'
  title: string
  text: string
}

/** Три тона карточек. Те же три, что работают в слое архитектора. */
const NOTE_TONE: Record<WorkspaceShellNote['tone'], { box: string; title: string; text: string }> = {
  recommended: {
    box: 'border-emerald-500/40 bg-emerald-500/10',
    title: 'text-emerald-900 dark:text-emerald-100',
    text: 'text-emerald-800 dark:text-emerald-200',
  },
  advice: {
    box: 'border-amber-500/40 bg-amber-500/10',
    title: 'text-amber-900 dark:text-amber-100',
    text: 'text-amber-800 dark:text-amber-200',
  },
  warning: {
    box: 'border-destructive/40 bg-destructive/10',
    title: 'text-destructive',
    text: 'text-destructive',
  },
}

/**
 * Пункт меню или вкладки.
 *
 * 🔒 ССЫЛКА ТОЛЬКО ТАМ, ГДЕ ЕСТЬ АДРЕС; пункт без адреса — ярлык, закрывающий
 * ящик. Мёртвая ссылка хуже её отсутствия, а закрывать ящик после выбора нужно —
 * иначе он остаётся поверх того, что человек только что открыл.
 *
 * 🔒 `aria-current` — ТОЛЬКО АКТИВНОМУ, И ТОЛЬКО ОДНОМУ: экранный диктор читает
 * его как «текущая страница», и два таких пункта означают, что человек находится
 * в двух местах сразу.
 */
function Item({
  item,
  base,
  activeClass,
  idleClass,
  closes,
  content,
}: {
  item: WorkspaceShellItem
  base: string
  activeClass: string
  idleClass: string
  closes?: string
  /** Готовая подпись: страница может отдать разметку, блок — размеченный текст. */
  content?: ReactNode
}) {
  const cls = base + (item.active ? activeClass : idleClass)
  const body = content ?? item.label
  if (item.href) {
    // 🔒 ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ — `next/link`, А НЕ ГОЛЫЙ `<a>` (253-3).
    //
    // ✗ ОПЛАЧЕНО ЖАЛОБОЙ ВЛАДЕЛЬЦА: «почему при переключении страниц весь экран
    // прыгает и моргает?» Голый `<a>` заставляет браузер загрузить документ
    // ЗАНОВО: белая вспышка, прыжок к началу, повторная гидратация. Измерено —
    // метка в памяти страницы стиралась, тип навигации `navigate`, 287 мс.
    //
    // 🔒 НА NO-JS ЭТО НЕ ВЛИЯЕТ: `Link` отдаёт настоящий `<a href>`, и при
    // выключенном JavaScript переход остаётся обычным. Запрет проекта касается
    // КЛИЕНТСКОГО КОМПОНЕНТА, ВЛАДЕЮЩЕГО МАРШРУТОМ, а не ссылки.
    //
    // 🛑 ЯКОРЬ (`#…`) ОСТАЁТСЯ ГОЛЫМ `<a>`: это не переход, а прокрутка по той же
    // странице, и плавность ей даёт `scroll-smooth`, а не роутер.
    if (item.href.startsWith('#')) {
      return (
        <a href={item.href} aria-current={item.active ? 'page' : undefined} className={cls}>
          {body}
        </a>
      )
    }
    return (
      <Link href={item.href} aria-current={item.active ? 'page' : undefined} className={cls}>
        {body}
      </Link>
    )
  }
  if (closes) {
    return (
      <label
        htmlFor={closes}
        aria-current={item.active ? 'page' : undefined}
        className={cls + ' cursor-pointer md:cursor-default'}
      >
        {body}
      </label>
    )
  }
  return (
    <span aria-current={item.active ? 'page' : undefined} className={cls}>
      {body}
    </span>
  )
}

export function WorkspaceShell({
  id,
  menuTitle,
  menuWord,
  menu,
  title,
  lead,
  notes,
  tabs,
  children,
  renderItem,
  renderTab,
}: {
  /** Уникальный на странице идентификатор: из него строится имя переключателя. */
  id: string
  menuTitle?: string
  /** Слово «Меню» на языке страницы — подпись кнопки, открывающей ящик. */
  menuWord: string
  menu: WorkspaceShellItem[]
  title: ReactNode
  lead?: ReactNode
  notes?: WorkspaceShellNote[]
  tabs?: WorkspaceShellItem[]
  children?: ReactNode
  /** Своя отрисовка подписи пункта — нужна там, где подпись размечена. */
  renderItem?: (item: WorkspaceShellItem, index: number) => ReactNode
  renderTab?: (item: WorkspaceShellItem, index: number) => ReactNode
}) {
  const drawer = `${id}-drawer`

  return (
    <div
      data-workspace
      className="mt-6 flex flex-col gap-6 rounded-xl border border-border bg-card p-4 md:flex-row md:gap-8 md:p-6"
    >
      {/* 🔒 ПЕРЕКЛЮЧАТЕЛЬ СТОИТ ПЕРВЫМ СРЕДИ СОСЕДЕЙ. Правило `peer-checked:`
          читает только ПРЕДШЕСТВУЮЩЕГО соседа; поставь его после меню — класс
          написан, эффекта нет, и отказ будет молчаливым. */}
      <input id={drawer} type="checkbox" className="peer sr-only" aria-hidden tabIndex={-1} />

      {/* Кнопка ящика. Существует только до `md`: на широком экране меню и так на
          виду, и кнопка к нему была бы предложением открыть открытое. */}
      <label
        htmlFor={drawer}
        data-workspace-open
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground md:hidden"
      >
        <Menu size={16} aria-hidden />
        {menuTitle ?? menuWord}
      </label>

      {/* ЛЕВАЯ ЧАСТЬ. До `md` — ящик в 90 % ширины, уехавший за левый край;
          `peer-checked` возвращает его на место. С `md` — липкая колонка.

          🔒 `self-start` ОБЯЗАТЕЛЕН У ЛИПКОЙ КОЛОНКИ: родитель — flex и по
          умолчанию растягивает её на всю высоту строки, а растянутому элементу
          некуда двигаться внутри собственной высоты — `sticky` молча перестаёт
          работать.

          🔒 `slim-scrollbar` — ТИХАЯ ПОЛОСА: жёлоба нет, остаётся бегунок. Без
          неё браузер рисует свой серый жёлоб во всю высоту ящика, и панель
          выглядит обрезанной по правому краю. */}
      <nav
        data-workspace-menu
        aria-label={menuTitle ?? menuWord}
        className="slim-scrollbar fixed left-0 top-0 z-40 h-dvh w-[90%] -translate-x-full overflow-y-auto border-r border-border bg-card px-3 py-4 shadow-xl transition-transform duration-200 peer-checked:translate-x-0 md:static md:z-auto md:h-auto md:max-h-[calc(100dvh-var(--wsx-top)-2rem)] md:w-60 md:shrink-0 md:translate-x-0 md:self-start md:shadow-none md:sticky wsx-sticky wsx-rule-up"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          {menuTitle ? <H4 variant="ui">{menuTitle}</H4> : <span aria-hidden />}
          <label
            htmlFor={drawer}
            data-workspace-close
            aria-label={menuWord}
            className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground md:hidden"
          >
            <X size={16} aria-hidden />
          </label>
        </div>

        {/* 🔒 ПУНКТ С РАЗДЕЛАМИ РАСКРЫВАЕТСЯ `<details>`, А НЕ ОСТРОВКОМ (253,
            решение владельца: «Эти вкладки должны быть расположены в
            раскрывающемся суб меню для кнопки строительства»). Раскладка
            намеренно серверная и работает при выключенном JavaScript — ящик уже
            открывается переключателем и CSS; клиентский островок ради одной
            раскрывашки сломал бы это свойство ради удобства написания.

            🔒 ОТКРЫТ, КОГДА ЧЕЛОВЕК ВНУТРИ ГРУППЫ. Закрытое подменю на странице
            своего же раздела прячет от человека то место, где он сейчас стоит.

            🔒 ЗАГОЛОВОК ПОДМЕНЮ — ССЫЛКА, ЕСЛИ У ГРУППЫ ЕСТЬ СВОЯ СТРАНИЦА, и
            просто подпись, если её нет. Ссылка в никуда хуже отсутствия ссылки, а
            стрелка рядом остаётся переключателем в обоих случаях. */}
        <ul className="flex flex-col gap-1">
          {menu.map((item, i) => (
            <li key={`${id}-m-${i}`}>
              {item.children && item.children.length > 0 ? (
                <details open={item.open ?? item.active} className="group/sub">
                  <summary
                    className={
                      'flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-[9px] py-2 text-[length:var(--fs-body)] transition-colors [&::-webkit-details-marker]:hidden hover:bg-muted/60' +
                      ((item.open ?? item.active) ? ' font-medium text-foreground' : ' text-muted-foreground hover:text-foreground')
                    }
                  >
                    {/* Подчёркивание — только когда открыта САМА страница группы,
                        а не какой-то её раздел: иначе отметка «вы здесь» стоит
                        в двух местах сразу. */}
                    <span className="flex min-w-0 items-center gap-2">
                    <MenuIcon name={item.icon} />
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-current={item.active ? 'page' : undefined}
                        className={
                          'max-w-full truncate whitespace-nowrap border-b-2 ' +
                          (item.active ? 'border-primary' : 'border-transparent')
                        }
                      >
                        {renderItem?.(item, i) ?? item.label}
                      </Link>
                    ) : (
                      <span className="truncate whitespace-nowrap">{renderItem?.(item, i) ?? item.label}</span>
                    )}
                    </span>
                    <ChevronDown
                      size={16}
                      aria-hidden
                      className="shrink-0 transition-transform duration-200 group-open/sub:rotate-180"
                    />
                  </summary>

                  <ul className="mt-1 ml-[9px] flex flex-col gap-1 border-l border-border pl-[9px]">
                    {item.children.map((sub, j) => (
                      <li key={`${id}-m-${i}-${j}`}>
                        {/* 🔒 АКТИВНЫЙ ПУНКТ ПОДМЕНЮ — НИЖНЯЯ ЛИНИЯ, А НЕ ЗАЛИВКА
                            (решение владельца 2026-09-19: «выпадающие вкладки
                            активные страницы лучше выделять не круговым
                            background, а просто нижним подчёркиванием»). Это тот
                            же стандарт, что уже принят для верхнего ряда
                            2026-09-01, — значит в слое стало ОДНО правило
                            выделения вместо двух.

                            🔒 `w-fit` ОБЯЗАТЕЛЕН: без него линия тянется во всю
                            ширину колонки и читается как разделитель списка, а не
                            как отметка «вы здесь». */}
                        <Item
                          item={sub}
                          closes={drawer}
                          base="block w-fit max-w-full truncate whitespace-nowrap border-b-2 px-0.5 py-1 text-[length:var(--fs-small)] transition-colors"
                          activeClass=" border-primary font-medium text-foreground"
                          idleClass=" border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                        />
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Item
                  item={item}
                  closes={drawer}
                  content={
                    item.icon ? (
                      <span className="flex min-w-0 items-center gap-2">
                        <MenuIcon name={item.icon} />
                        <span className="truncate">{renderItem?.(item, i) ?? item.label}</span>
                      </span>
                    ) : (
                      renderItem?.(item, i)
                    )
                  }
                  base="block truncate whitespace-nowrap rounded-md px-[9px] py-2 text-[length:var(--fs-body)] transition-colors"
                  activeClass=" bg-muted font-medium text-foreground"
                  idleClass=" text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                />
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* ПРАВАЯ ЧАСТЬ. `min-w-0` держит длинное содержимое внутри колонки: без
          него таблица или строка кода растягивает flex-элемент и ломает
          раскладку целиком. */}
      <div data-workspace-content className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <H3>{title}</H3>
          {lead && <P className="mt-1 text-muted-foreground">{lead}</P>}
        </div>

        {notes && notes.length > 0 && (
          <div data-workspace-notes className="flex flex-col gap-2">
            {notes.map((note, i) => {
              const tone = NOTE_TONE[note.tone]
              return (
                <div key={`${id}-n-${i}`} data-tone={note.tone} className={`rounded-lg border p-3 ${tone.box}`}>
                  <P className={`font-semibold ${tone.title}`}>{note.title}</P>
                  <Small className={`mt-1 block ${tone.text}`}>{note.text}</Small>
                </div>
              )
            })}
          </div>
        )}

        {/* ВЕРХНИЙ РЯД РАЗДЕЛОВ. Липкий с `md` — ровно так же, как левое меню, и по
            той же причине (владелец 2026-08-30): «когда лента в правой секции очень
            большая, механизмы навигации уходят далеко вверх, что делает невозможным
            навигацию между вкладками до того, как я верну страницу».

            🔒 ПРАВКА ОДНА, А СТРАНИЦ ТРИ. Оболочку зовут и вид каталога
            `workspace`, и обе страницы слоя архитектора — настройки проекта и
            дизайн. Ряд разделов рисуется здесь и только здесь, поэтому изменение
            доезжает до всех троих само.

            🔒 ФОН ОБЯЗАТЕЛЕН У ЛИПКОГО РЯДА. Прозрачный он пропускает под собой
            уезжающее содержимое, и текст читается сквозь ярлыки.

            🔒 СТИКИ ЖИВЁТ, ПОКА НИ ОДИН ПРЕДОК НЕ СТАЛ КОНТЕЙНЕРОМ ПРОКРУТКИ.
            `overflow: hidden` у любого родителя выключает его МОЛЧА — тем же днём
            это правило чуть не поставили на корень страницы ради полосы `promoBand`;
            там выбран `clip`, а потом снят и он. */}
          {/* 🔒 АКТИВНАЯ ВКЛАДКА — НИЖНЯЯ ЛИНИЯ, А НЕ ОБВЕДЁННАЯ ТАБЛЕТКА
              (2026-09-01, решение владельца, закрепляющее стандарт).

              ✗ ЧЕМ ОПЛАЧЕНО. Здесь стояла рамка у КАЖДОЙ вкладки и заливка у
              активной. Пять обведённых прямоугольников в ряд спорят с левым меню,
              где рамки уже есть, и ряд читается как вторая панель, а не как
              разделы одной. Владелец назвал это «нестандартным дизайном» — и был
              прав по сути: узора подчёркивания в корпусе не существовало вовсе,
              то есть стандарта не было ни здесь, ни где-либо ещё.

              🔒 ПОЛОСА ПОД ВСЕМ РЯДОМ ДЕРЖИТ ЛИНИЮ. Без неё подчёркивание
              активной вкладки висит в пустоте и читается как случайная черта, а
              не как «вот эта из пяти».

              🔒 ПРАВКА ОДНА, А ПОТРЕБИТЕЛЕЙ ТРИ, и это сказано владельцу ДО неё:
              ряд рисует блок `workspace` (уезжает КАЖДОМУ клиенту), его образец в
              каталоге блоков и разделы слоя архитектора. Другого места, где
              рисуются вкладки, в проекте нет — примитива `tabs` у нас тоже нет. */}
        {tabs && tabs.length > 0 && (
          <nav
            data-workspace-tabs
            aria-label={typeof title === 'string' ? title : menuWord}
            className="slim-scrollbar wsx-strip -mx-1 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border bg-card px-1 pb-2 md:sticky wsx-sticky md:z-30 md:pt-3"
          >
            {tabs.map((tab, i) => (
              <Item
                key={`${id}-tab-${i}`}
                item={tab}
                content={renderTab?.(tab, i)}
                base="-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-[length:var(--fs-small)] transition-colors"
                activeClass=" border-primary font-medium text-foreground"
                idleClass=" border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              />
            ))}
          </nav>
        )}

        {/* 🔒 ПЛАВНАЯ ПРОКРУТКА РЯДА — ОСТРОВОК, И ОН РИСУЕТСЯ ТОЛЬКО ВМЕСТЕ С
            РЯДОМ. Нет ряда — нет и подписки: страница без вкладок не платит за
            способность, которой не пользуется. Что именно он чинит и почему это
            обход, а не лечение корня, — в самом файле. */}
        {tabs && tabs.length > 0 && <TabsScroll />}

        {/* 285-0: левое меню помнит прокрутку между страницами — причина и устройство в самом файле. */}
        {menu.length > 0 && <MenuScrollKeep />}

        {children && <div data-workspace-body className="flex flex-col">{children}</div>}
      </div>
    </div>
  )
}
