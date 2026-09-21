import type { FooterPageCell } from '@/lib/pages/footer-page'

export const en: FooterPageCell = {
  eyebrow: 'Host',
  title: 'Your project on a dedicated server',
  description:
    'Move your Fractera node from a home computer to a dedicated server: the site runs around the clock, no longer depends on whether your computer is on, and stays yours.',
  keywords: 'dedicated server, VPS, hosting, deployment, Fractera, node',
  blocks: [
    {
      kind: 'p',
      text: 'You can deploy this project on a dedicated server so the site answers around the clock — even when your computer is off, rebooting or travelling with you. The code, the data and the domain stay yours: you rent the server, and nobody but you controls it. Back to [%SITE%](/en).',
    },
    { kind: 'h2', text: 'What you get' },
    {
      kind: 'list',
      items: [
        '**A site that never sleeps.** A home node runs while the computer runs; a server runs always.',
        '**The same project, no rework.** The whole core moves — pages, sign-in, data and replaceable blocks.',
        '**Your domain, your rules.** The address belongs to you, not to us: should Fractera disappear tomorrow, your site keeps working.',
        '**No subscriptions to other services.** Sign-in, database and storage are already inside the project.',
      ],
    },
    { kind: 'h2', text: 'How it works' },
    {
      kind: 'olist',
      items: [
        'You rent an Ubuntu server from any provider.',
        'On the node’s internal page you enter the server address and start the installation.',
        'The node moves to the server and keeps running under your domain.',
      ],
    },
    {
      kind: 'note',
      text: 'The deployment form lives inside the node, in the architect layer: only the project owner can open it.',
    },
    {
      kind: 'cta',
      href: '/en/architect/hosting/hosting',
      label: 'Go to deployment',
    },
  ],
}
