import { ProjectFooter } from "@/components/shell/project-footer";
import { loadProjectShell } from "@/components/shell/remote-shell";
import { coreShellWhere } from "@/lib/shell/core-shell-where";

// ПОДВАЛ ЯДРА = ПОДВАЛ ПРОЕКТА (285-3). Вид — `components/shell/project-footer.tsx` (копия сайта), данные —
// дверь сайта `/api/shell/<язык>`: страницы подвала сайта, имя ссылкой в корень проекта, соцсети, ширина, тема,
// язык — те же, что у сайта; выбор посетителя — в cookie проекта, на все страницы.
// 🪦 Прежний подвал ядра (своя копия подвала сайта) — git history этого файла.
export async function FooterMenu({ lang }: { lang: string }) {
  const data = await loadProjectShell(lang, coreShellWhere());
  if (!data) return null;
  return <ProjectFooter data={data} />;
}
