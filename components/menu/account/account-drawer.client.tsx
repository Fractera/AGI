"use client";

import Link from "next/link";
import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuthShellSide } from "@/components/menu/account/account-config";
import type { AccountLabels } from "@/components/menu/account/account-menu.i18n";

// 🪦 ТАБЛИЦА ЗАГОЛОВКОВ СЛОЁВ УДАЛЕНА (230-1, 2026-09-18, слово владельца:
// «вообще не нужно показывать деления по разделам и роли»). Ящик больше не
// знает о слоях прав ничего — ссылки идут одним списком в том порядке, в
// котором их даёт приложение.

// Full-height account drawer (step 161). Opens from the side set by NEXT_PUBLIC_APP_SHELL_AUTH;
// taller than the left/right page drawers (which start below the header). Three zones:
//   (top) sticky title; (middle) scroll area — a flat list of the work links the
//   application provides; (bottom) fixed: the email, then sign out.
// carry a third drawer. UI standard: shadcn Sheet (Radix) + lucide; trigger = shadcn Button
// (Base UI, no asChild) driving controlled state.
//
// 🪦 БЫЛ РАЗБИТ ПО ЧЕТЫРЁМ СЛОЯМ ПРАВ (отменено 230-1, 2026-09-18 по слову
// владельца). Довод был такой: сотрудник бывает менеджером и финансистом разом,
// и человеку полезно видеть, в каком качестве он действует. Он верен для проекта,
// где эти разделы построены, и обращается в свою противоположность там, где их
// ещё нет: ящик состоял из четырёх заголовков, значков ролей и четырёх надписей
// «здесь пока ничего не построено».
//
// 🔒 ПУНКТЫ ПРИХОДЯТ СПИСКОМ, А НЕ ЗАШИТЫ ЗДЕСЬ. Ящик — переиспользуемая часть
// продукта, живущая на всех 82 языках; страницы проекта у каждого клиента свои.
// Впиши сюда «Управление товарами» — и слово либо соврёт про 82 языка, либо
// потребует перевода на 82 ради страницы, которой в соседнем проекте нет.
// Поэтому ящик знает ФОРМУ пункта и названия слоёв (это его словарь), а чем
// наполнить слои — решает приложение, там же, где живут слова этих страниц.
export type DrawerLink = {
  href: string;
  label: string;
  /**
   * Кому показывать пункт (268). Нет поля — всем вошедшим. Вежливость, а не
   * защита: замок стоит на самой странице.
   */
  roles?: readonly string[];
};


export function AccountDrawer({ lang, side, labels, email, roles = [], links }: {
  lang: string;
  side: AuthShellSide;
  labels: AccountLabels;
  email?: string;
  /** Роли вошедшего — бейджами над почтой (260-5). */
  roles?: string[];
  /** Пункты рабочих разделов — их состав задаёт приложение. */
  links?: DrawerLink[];
}) {
  const [open, setOpen] = useState(false);

  // 🔒 ПУСТОЙ СПИСОК ОСТАЁТСЯ ПУСТЫМ, А НЕ ПРЕВРАЩАЕТСЯ В НАДПИСЬ (владелец,
  // 2026-09-18: «сейчас нет никаких ссылок поэтому не нужно показывать пустые
  // разделы»). Раньше слой без страниц честно сообщал «здесь пока ничего не
  // построено»; в проекте, где рабочих разделов ещё нет вовсе, из этой честности
  // выходил ящик из четырёх заголовков и четырёх извинений.
  // Пункт со списком ролей виден только тому, у кого есть хоть одна из них (268).
  const items = (links ?? []).filter((l) => !l.roles || l.roles.some((r) => roles.includes(r)));

  return (
    <>
      {/* md and narrower: avatar only — owner 2026-09-23: «если ширина экрана md или меньше то ты
          показываешь только иконку» (278). The label shows from lg and stays the accessible name at
          every width. */}
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={labels.account} title={labels.account}>
        <User /><span className="hidden lg:inline">{labels.account}</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={side} className="w-80 sm:max-w-sm p-0 gap-0 flex flex-col">
          <SheetHeader className="border-b border-border">
            <SheetTitle>{labels.account}</SheetTitle>
          </SheetHeader>

          {/* Middle (step 500) — the Projects accordion is gone together with the
              projects layer. The drawer now says whose workspace this is: name and
              description straight from APP-CONFIG, the same pair the home renders. */}
          {/* Середина — рабочие разделы по слоям прав. Роль сверяется ЗДЕСЬ только
              ради того, чтобы не показывать заведомо закрытую дверь: настоящая
              проверка стоит на самой странице (layout подгруппы) и в маршрутах
              данных. Спрятанный пункт — вежливость, а не защита, и путать эти два
              не следует никогда. */}
          {/* 🔒 СЕРЕДИНА — ПЛОСКИЙ СПИСОК ССЫЛОК, БЕЗ СЛОЁВ И БЕЗ РОЛЕЙ
              (владелец, 2026-09-18: «когда в будущем будут появляться ссылки
              пусть они идут просто обычным текстом традиционно без деления по
              личной персонал финансы администрирование и без ролей»).

              🪦 Здесь стояли четыре подписанных слоя прав, цветная точка потока у
              каждого заголовка, перечень всех возможных ролей слоя значками и
              надпись «здесь пока ничего не построено» для пустого слоя. Довод в
              пользу слоёв был такой: сотрудник бывает и менеджером, и финансистом
              разом, и человеку полезно видеть, в каком качестве он действует.
              Довод верен для проекта, где эти разделы построены; в проекте, где
              рабочих страниц ещё нет, он давал ящик из одних заголовков.

              🔒 ПРОВЕРКА ПРАВ НЕ ПОСТРАДАЛА, и это стоит сказать прямо: спрятанный
              пункт всегда был вежливостью, а не защитой. Замок стоит на самой
              странице (layout подгруппы) и в маршрутах данных, и он на месте. */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {items.length > 0 && (
              <nav className="flex flex-col gap-0.5">
                {items.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start")}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Bottom — fixed: identity row on top, sign out below; both left-aligned. */}
          <div className="mt-auto border-t border-border p-3 flex flex-col gap-3">
            {/* 🪦 «БЕЗ РОЛЕЙ» (230-1, 2026-09-18) ОТМЕНЕНО ДЛЯ НИЖНЕЙ СТРОКИ 2026-09-21
                новым словом владельца: «выдвижной ящик … больше не показывает роль …
                фиксированный контейнер над e-mail … как бейджи … в одну линию с
                горизонтальным скролом без скроллбара». Середина ящика остаётся
                плоским списком ссылок без слоёв — то решение не тронуто.
                🔒 Бейджи — ответ на вопрос «кто я здесь», не замок: права по-прежнему
                проверяют страница и маршруты данных. */}
            {roles.length > 0 && (
              <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary" className="shrink-0">{r}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-foreground truncate">{email}</span>
            </div>
            <Separator />
            {/* Sign out mirrors sign-in (step 169): a RELATIVE /logout link that proxy.ts
                (AUTH_FORM_PATHS) redirects to the auth service with an absolute redirectUrl
                back to this site. Never a bare /api/auth/* path — this app has none (404). */}
            {/* 🔒 prefetch={false} — ОБЯЗАТЕЛЕН НА ВСЕХ АДРЕСАХ АВТОРИЗАЦИИ (владелец нашёл
                в консоли 2026-08-13, тот же класс, что у /login часом раньше).
                Next заранее тянет страницы по видимым ссылкам, а /logout уводит
                переадресацией на ДРУГОЙ домен — слой авторизации. Браузер видит
                запрос через границу источника, не находит разрешающего заголовка
                и пишет ошибку CORS. Ошибок было девять на страницу, и все они —
                предзагрузка, которой никто не просил: выйти можно только нажав.
                Список таких адресов уже есть — AUTH_FORM_PATHS в proxy.ts. */}
            <Link href={`/logout?lang=${lang}`} prefetch={false} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start")}>
              <LogOut />{labels.signOut}
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
