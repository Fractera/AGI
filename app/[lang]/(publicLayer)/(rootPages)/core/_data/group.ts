// Манифест страницы Core для сканера верхнего меню (261-4). Подпись берётся из имени
// папки («Core»): своей языковой ячейки у страницы нет, текст — главной.
// Порядок меню — слово владельца 2026-09-21: Core · AGI · WEB3 · M2M · Nostr · Blog.
export const group = {
  slug: 'core',
  roles: "public",
  childrenAsDropdown: false,
  menus: {
    top: { enabled: true, order: 5 },
    footer: { enabled: false, order: 10 },
    left: { enabled: false, order: 10 },
    right: { enabled: false, order: 10 },
  },
}
