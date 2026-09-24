import { slotHasGroups } from "@/lib/menu/group-menus";
import { DrawerToggle } from "@/components/menu/shared/drawer-toggle.client";
import { topMenuUi } from "@/components/menu/top/top-menu.i18n";
import { ProjectHeader } from "@/components/shell/project-header";
import { loadProjectShell } from "@/components/shell/remote-shell";
import { coreShellWhere } from "@/lib/shell/core-shell-where";

// ШАПКА ЯДРА = ШАПКА ПРОЕКТА (285-3). Вид — `components/shell/` (копия сайта байт в байт, `npm run
// shell-kit:add`, сторож `check:shell-kits`); данные — дверь сайта `/api/shell/<язык>` на сборке ядра: то же
// меню, имя, вход, что у сайта. Здесь остаётся только своё у ядра — кнопки ящиков слева/справа.
//
// 🪦 До 285 ядро собирало шапку само из копии кода сайта и меню сайта (283-1, `lib/menu/site-menu-remote.ts`)
// и откатывалось на своё меню, если сайт не ответил. Прежний текст — git history этого файла.
// 🛑 Сайт не ответил на сборке — шапки нет, и это напечатано в журнале сборки (`[project-shell]`).
export async function TopMenu({ lang }: { lang: string }) {
  const data = await loadProjectShell(lang, coreShellWhere());
  if (!data) return null;
  const ui = topMenuUi(lang);
  const leftHas = slotHasGroups("left", lang);
  const rightHas = slotHasGroups("right", lang);
  return (
    <ProjectHeader
      data={data}
      leftSlot={leftHas ? <DrawerToggle side="left" labels={{ open: ui.openLeft, close: ui.closeLeft }} /> : undefined}
      rightSlot={rightHas ? <DrawerToggle side="right" labels={{ open: ui.openRight, close: ui.closeRight }} /> : undefined}
    />
  );
}
