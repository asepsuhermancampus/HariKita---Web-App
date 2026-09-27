# Task 8 — Sandbox preview

- Added isolated fixture profile for couple, events, gallery, map, RSVP, guestbook, gifts, rundown, dress code, entourage and quote/prayer data.
- Added all sixteen section render paths through the same StudioSceneRenderer as the editor canvas. Disabled optional sections are omitted; cover/closing remain present; authored order is preserved.
- Added 375px, 768px and desktop preview modes with local controlled RSVP/guestbook simulation. No production action, client/vendor identity, RSVP record or payment path is called.
- Preview button is connected to StudioShell.
- Verification: focused preview tests 2/2, typecheck passed. Full suite will be rerun after Task 9 integration.
- Browser visual checks remain unavailable in this environment; SSR fixture output was verified at all three widths.
