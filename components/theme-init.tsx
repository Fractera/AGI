import Script from "next/script";
import { READ_PREF_JS } from "@/lib/shared-prefs";

// Inline theme bootstrap (runs before paint to avoid a light/dark flash). Shared by
// every root-owning zone ([lang] + (service)) after the static-rendering refactor
// (step 131), so the script lives in one place instead of being duplicated per layout.
const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME ?? "light";

const themeScript = `
(function() {
  // 🛑 Запрещённое хранилище БРОСАЕТ на обращении к свойству, а не возвращает
  // null: без try/catch этот скрипт валится до отрисовки, в самом head.
  var saved = null;
  saved = (${READ_PREF_JS})('fractera-theme'); // 285-2: cookie проекта, иначе память адреса
  var theme = saved || '${defaultTheme}';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
})();
`;

export function ThemeInit() {
  return (
    <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
  );
}
