import type { WorkspacePageWords } from '@/lib/collection/types'

// СЛОВА СТРАНИЦЫ «Domain activation».
//
// 🔒 ФАКТЫ О CLOUDFLARE ВЗЯТЫ ИЗ ПЕРВОИСТОЧНИКА 2026-09-21, а не по памяти:
// developers.cloudflare.com — создание именованного туннеля, добавление домена в
// Cloudflare и FAQ туннелей. Что подтвердить не удалось, названо вслух в тексте.

export const en: WorkspacePageWords = {
  title: 'Domain activation',
  lead: 'Point your own domain at this node and stop depending on a temporary address.',
  topics: [
    {
      anchor: 'why',
      tab: 'Why',
      title: 'What a permanent address changes',
      text:
        'Today the node is published through a temporary address that is issued for hours and changes on every restart. That address cannot carry sign-in: a session is bound to a name, so an account created on it stops being recognised the moment the name changes. Search engines do not index it either. A domain of your own removes all of this at once — and it stays yours, not ours.',
      points: [
        'Sign-in, registration and sign-out start working — they are switched off on a temporary address on purpose.',
        'The address stops changing, so a link you gave someone keeps working.',
        'The certificate is issued and renewed for you; nothing to install by hand.',
        'The domain is registered to you. If Fractera disappears tomorrow, your site keeps working.',
      ],
    },
    {
      anchor: 'how',
      tab: 'How it works',
      title: 'No public IP, no open ports',
      text:
        'The node does not wait for connections from the internet. A small program on this machine opens an outbound connection to Cloudflare and holds it; requests to your domain travel back through it. That is why a home computer behind a router works with no port forwarding and no static IP. The only network requirement stated by Cloudflare is outbound access to their network on port 7844.',
    },
    {
      anchor: 'steps',
      tab: 'Steps',
      title: 'Five steps, once',
      text:
        'You do this once. Steps 1 and 2 happen at your domain registrar and in the Cloudflare dashboard; steps 3 to 5 take a few minutes.',
      points: [
        '1. Register a domain, or take one you already own.',
        '2. Add it to Cloudflare: dashboard → Onboard a domain → enter the apex domain (example.com) → select a plan. Cloudflare then gives you two nameservers, and you enter them at your registrar. Until the nameservers are changed, nothing else works — this is the step that takes the longest.',
        '3. In the Cloudflare dashboard open Networking → Tunnels → Create a tunnel, give it a name, choose this operating system and copy the installation command it shows.',
        '4. Run that command on this computer. The tunnel connects and appears as connected in the dashboard.',
        '5. On the tunnel Routes tab: Add route → Published application → choose your subdomain and domain, and set Service URL to the node address shown on this page. Save.',
      ],
    },
    {
      anchor: 'cost',
      tab: 'Cost',
      title: 'What it costs, honestly',
      text:
        'The domain itself is paid — that is the registrar, not Cloudflare, and the price depends on the zone. Cloudflare has a free tier for domains: its own documentation speaks of "Free, Pro, and Business plans", and the only limit quoted there for tunnels concerns serving video and other large files, which a node like this does not do. We did not find a page stating the tunnel price outright, so treat this as: free plan exists, verify the current terms in your dashboard before paying for anything.',
    },
    {
      anchor: 'after',
      tab: 'After',
      title: 'What changes on this node',
      text:
        'Nothing has to be rebuilt. The node reads its address at runtime, so once the domain answers, sign-in and registration open by themselves and the warning page stops appearing. The temporary address may keep working alongside; it is no longer needed and can be stopped.',
    },
  ],
}
