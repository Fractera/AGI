# elementPreview — a live preview of an element

**Type:** Page material. The first page of each element section of the architect layer (Root, Authorization,
Data). **Decision of the owner, 2026-09-24:** the Root section's Preview shows the root application, and the
same standard goes to sign-in and data. Drawn by `WebPreview` from AI Elements (vendored in
`components/ai-elements/web-preview.tsx` from the AI Elements registry, imports pointed at our primitives).

The address is asked of `/api/node/preview-url` in the browser: on an own domain the public one (site —
the zone root, sign-in — `auth.<zone>`), otherwise the loopback of this machine, and then the page says
that the preview opens only on this computer. The element itself must allow being framed by the core
(`frame-ancestors`).
