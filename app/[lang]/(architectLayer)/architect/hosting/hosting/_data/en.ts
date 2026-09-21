import type { WorkspacePageWords } from '@/lib/collection/types'

// 261-7: the public Host page's button leads here. See the Russian cell for the owner's word.
export const en: WorkspacePageWords = {
  title: 'Dedicated server',
  lead: 'The node will bring itself up on your own server: the site runs around the clock, even when this computer is off, and the domain, code and data stay yours. The order is: first the project answers on the server’s IP address over HTTP; then the records of the domain and its sign-in subdomain move from this computer’s tunnel to the server’s IP (if your regulator forbids Cloudflare, the domain leaves it entirely); then HTTPS is switched on with a Let’s Encrypt certificate or your own. The deployment form will appear on this page.',
}
