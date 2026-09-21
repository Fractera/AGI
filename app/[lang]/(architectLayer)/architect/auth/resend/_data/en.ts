import type { WorkspacePageWords } from '@/lib/collection/types'

// Words of the page «Sign-in letter (Resend)». This file is the BASE language.

export const en: WorkspacePageWords = {
  title: 'Sign-in letter (Resend)',
  lead: 'Entry by a letter instead of a password: one key, and no password is stored at all.',
  topics: [
    {
      anchor: 'why',
      tab: 'Why',
      title: 'Sign-in with nothing to remember',
      text:
        'A person types their email, gets a letter and presses the link in it — and they are in. No password is invented or stored anywhere, so it can be neither forgotten nor stolen. For anyone without a Google account, or who would rather not use it, this is the shortest way in.',
      points: [
        'It works alongside email and password and the Google button — the visitor chooses.',
        'The first person in becomes the architect, everyone after an ordinary user — same as the other methods.',
        'The link in the letter works once: it cannot be used a second time.',
      ],
    },
    {
      anchor: 'from-resend',
      tab: 'What Resend needs',
      title: 'Resend delivers the letters, and needs proof of one thing — that the domain is yours',
      text:
        'Resend is the service that actually sends the letter. It issues the key to you, under your own account, and nobody can obtain it on your behalf. The real work here belongs neither to us nor to Resend but to your domain\'s DNS records: they are how the whole internet learns that a letter sent in your name was really sent by you.',
      points: [
        'Resend\'s free plan is enough to start.',
        'The DNS records go where your domain\'s records live — usually the same panel where you connected the domain to this node.',
        'Until the domain is verified, letters reach only the owner of the Resend account. That is not a fault: it is how Resend protects other people\'s inboxes from an unverified sender.',
      ],
    },
    {
      anchor: 'care',
      tab: 'Worth knowing',
      title: 'Three things to know before you start',
      text:
        'The key goes straight into your sign-in service and takes effect when it restarts, which happens by itself in a few seconds. The node does not keep the key and cannot show it back; the sender address, by contrast, is always visible — it is not a secret.',
      points: [
        'A letter from an unverified address may not arrive, or may land in spam. If one does not arrive, look in Resend first: is the domain verified, and what does it say about the last send.',
        'Change your domain and you will need to add the new one in Resend and change the sender: old DNS records do not apply to a new domain.',
        'You can switch it off at any moment with the button below: the key is erased, the option disappears, the sender is remembered for next time.',
      ],
    },
  ],
}
