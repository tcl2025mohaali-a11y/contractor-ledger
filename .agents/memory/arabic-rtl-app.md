---
name: Arabic RTL app conventions
description: Notes for building Arabic-language, RTL-first web apps in this workspace.
---

- When the user's own content/examples are written in Arabic, that's a strong signal to build the UI in Arabic with RTL layout — confirm with a quick question only when platform scope (web vs. native mobile) is genuinely ambiguous, not the language itself.
- Set RTL at the root (`dir="rtl"`) rather than per-component; let the design subagent handle font choice and RTL-aware spacing.
- For money displays, tell the design subagent to use `Intl.NumberFormat` with the correct currency/locale rather than hand-formatting numbers.

**Why:** Confirming platform scope (responsive web vs. native iOS via Expo) before building avoided doubling the build for a request that only needed a responsive web app.
