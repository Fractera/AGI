import type { WorkspacePageWords } from '@/lib/collection/types'

// Words of the page «Sign in with Google». This file is the BASE language.

export const en: WorkspacePageWords = {
  title: 'Sign in with Google',
  lead: 'Turn on the Google button: what you fill in, where you get it, and what the visitor sees.',
  topics: [
    {
      anchor: 'why',
      tab: 'Why',
      title: 'What changes for the people who come to you',
      text:
        'Email and password ask a person to invent one and remember it, and few will do that for a single visit. The Google button removes that step whole: they press it and they are in, having invented nothing. For you it does not replace the password — it stands beside it: both work at once, and the visitor chooses.',
      points: [
        'No password is created or stored anywhere on this path — not by you, not by us.',
        'Google verifies the address itself, so the email is genuine by construction.',
        'The first person in becomes the architect, everyone after is an ordinary user — same as with email.',
      ],
    },
    {
      anchor: 'from-google',
      tab: 'What Google gives',
      title: 'The pair is issued by Google, and only to you',
      text:
        'This is not our setting and not our key: Google issues the pair to the owner of the domain, under their own account, and nobody can obtain it on your behalf. It is done once, it is free, and it takes a few minutes.',
      points: [
        'Open Google Cloud Console and create a project — it is only a container, nobody sees its name.',
        'Set up the consent screen: type External, the application name (people see it while signing in) and your contact email. While you are the only user, adding yourself as a test user is enough.',
        'Create credentials: Credentials → Create credentials → OAuth client ID → type Web application.',
        'Into «Authorized redirect URIs» paste the return address shown below — it is taken from your own service, not written by us.',
        'Google then shows a client id and a client secret. The secret is shown once — copy it before closing that page.',
      ],
    },
    {
      anchor: 'care',
      tab: 'Worth knowing',
      title: 'Two things to know before you start',
      text:
        'The keys go straight into your sign-in service and take effect when it restarts, which happens by itself and takes a few seconds. The node does not keep them and cannot show them back: it knows only whether they are set.',
      points: [
        'A provider with a wrong pair is worse than one switched off: the button appears and fails. Turning it on is switching on a capability, not saving a field.',
        'Change your domain and the return address changes with it — it has to be pasted into Google again, or sign-in stops working.',
        'You can switch it off at any moment with the button below: the keys are erased, the Google button disappears, email sign-in keeps working.',
      ],
    },
  ],
}
