import type { WorkspacePageWords } from '@/lib/collection/types'

// Words of the page «Authorization». This file is the BASE language; ru overrides it.
//
// 🔒 EVERY CLAIM HERE WAS MEASURED IN CODE BEFORE IT WAS WRITTEN, and where a
// claim could not be measured it is absent rather than softened. The measurements
// are listed in the step record (264-2): the role list, the two registration
// paths, the development bypass, the three sign-in methods, the tunnel.

export const en: WorkspacePageWords = {
  title: 'Authorization',
  lead: 'Who signs in to your node, with what, and what each role is allowed to open.',
  topics: [
    {
      anchor: 'what',
      tab: 'What it is',
      title: 'One door for the whole node',
      text:
        'Sign-in is a replaceable block of its own: its own process, its own repository, its own database. It covers everything on this node at once — the core, the data layer and every application you build here — because a node hands out entry in exactly one place. Two sign-ins on one machine is the same as none: each would call the other a stranger.',
      points: [
        'It is the only block that issues sessions; everything else asks it who came.',
        'It keeps its own accounts, so losing an application does not lose your users.',
        'You can replace it with someone else\'s: the addresses and the shape of its answers are the contract, and they do not change with the block.',
      ],
    },
    {
      anchor: 'roles',
      tab: 'Roles',
      title: 'Fourteen roles, and the first person gets all of them',
      text:
        'The service ships with a fixed vocabulary of roles — access tiers, buyer tiers, staff and operations, administration. The first account created on a fresh node is the architect: it receives every role except the guest one, which is a state rather than a right. That is how you got the pages you are reading now.',
      points: [
        'Fourteen roles are handed to the first account; a fifteenth name, guest, marks "not signed in" and is never granted.',
        'Everyone after the first gets the plain user role, and you hand out the rest yourself.',
        'A role is checked by the platform, not by your application code — that is why a page can be closed without touching what it renders.',
      ],
    },
    {
      anchor: 'modes',
      tab: 'Sign-in methods',
      title: 'Three ways in, and you choose which are on',
      text:
        'All three are already built into the service. Which ones a visitor sees is decided by the keys you fill in: a method with no credentials is not shown at all, so nobody meets a button that cannot work.',
      points: [
        'Email and password — on from the first minute, and deliberately without password recovery. There is no reset route in the service at all: a recovery letter is only as trustworthy as the mailbox behind it, and on a fresh node there is no mail yet.',
        'Google — the code is in place and waits for a client id and a client secret. Fill them in and the button appears.',
        'A sign-in letter through Resend — same thing: the code is in place and waits for one API key. No password is stored at all; the letter is the key.',
      ],
    },
    {
      anchor: 'development',
      tab: 'Development mode',
      title: 'In development there is no lock — and that is your way back',
      text:
        'When the node runs in development mode, sign-in is switched off whole: roles and session states are ignored before anything else is checked. This is worth knowing for one reason above all. If you break registration while changing it, you are not locked out of your own project: start in development mode, go back to the last working state, and start again.',
      points: [
        'Your node runs in production, not development — that is why its pages are prebuilt and open instantly.',
        'Development mode is a way in for the owner of the machine, not a hole in the internet: it lives on this computer, not on the address you publish.',
      ],
    },
    {
      anchor: 'address',
      tab: 'Temporary address',
      title: 'On a quick tunnel address sign-in does not work',
      text:
        'A quick Cloudflare address publishes exactly one name — the node itself. Sign-in lives next to it under its own name, and on a temporary address that name does not exist, so the button leads nowhere. This is not a setting you have missed: it arrives with your own domain, where the site and its sign-in ride the same tunnel under two names.',
      points: [
        'On a connected domain both names are published at once, and the certificate covers both.',
        'A session is bound to the name it was created under, so an account made on an address that changes every restart would stop being recognised anyway.',
      ],
    },
    {
      anchor: 'guest',
      tab: 'Guest access',
      title: 'History that survives the moment someone registers',
      text:
        'A visitor can be given a guest session before they have an account. It matters whenever what a person does is worth keeping before they commit to you — a chat that remembers the conversation, a shop that keeps a basket. Their activity is written to the database under that guest session, and when they do register the history is attached to the real account rather than thrown away.',
    },
    {
      anchor: 'caution',
      tab: 'Before you change it',
      title: 'Rewrite registration early, not later',
      text:
        'Changing the code of sign-in is normal work, and it has one sharp edge: break it while people are already using the node and you lock out both them and yourself. Do it before real use starts. One thing softens it — your application keeps working regardless, because sign-in is a separate process with a separate database: what breaks is entry, not the product.',
    },
    {
      anchor: 'real-data',
      tab: 'Real data',
      title: 'Use your real details from the first day',
      text:
        'Your node is meant to meet other nodes: to add services it does not have, and to sell what it does. An identity assembled from test values cannot carry that, and rebuilding it later means rebuilding every agreement made under it. Enter your real details on the first day, while nothing depends on them yet.',
    },
  ],
}
