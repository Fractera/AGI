// Манифест страницы Host для сканера верхнего меню (261-7). Порядок — слово владельца
// 2026-09-21: «после кнопки -core добавил -Host». Меню: Core · Host · AGI · WEB3 · M2M · Nostr · Blog.
export const group = {
  slug: 'host',
  roles: "public",
  childrenAsDropdown: false,
  menus: {
    top: { enabled: true, order: 7 },
    footer: { enabled: false, order: 10 },
    left: { enabled: false, order: 10 },
    right: { enabled: false, order: 10 },
  },
}
