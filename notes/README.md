# Notes

Every `.md` file in this folder becomes a note in the desktop site's **Ideas** (Notes) app.

```md
---
title: My note
date: 2026-09-25      # used for ordering and the "Today / Mon / Sep 3" label
pinned: false         # pinned notes appear under "Pinned" with a pin icon
---

Regular **markdown**: paragraphs, headings, lists, `code`, links and > quotes.
```

`npm run notes` converts them into `src/content/notes.json`; it runs automatically before
`npm start` and `npm run build`. This README is ignored.
