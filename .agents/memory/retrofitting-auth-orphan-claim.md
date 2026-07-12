---
name: Retrofitting auth onto an app with existing/seeded data
description: Pattern for adding per-user ownership to rows that were created before authentication existed.
---

When a request asks to bolt Clerk/user auth onto an app that already has real (often user-provided example) data in it, don't delete the seed data and don't guess which future user should own it.

Pattern:
1. Add the owner column (e.g. `userId`) as **nullable**.
2. On the first authenticated read of the owning list endpoint, run a one-time `UPDATE ... SET user_id = $currentUser WHERE user_id IS NULL` to claim any orphaned rows.
3. Scope every other query strictly by `userId` after that.

**Why:** Preserves real example data the user is emotionally invested in (e.g. their actual project/expense entries) without requiring a manual migration step or asking the user to re-enter it, while still giving proper per-account isolation from that point forward.

**How to apply:** Only for genuinely private-per-user data models decided with the user (see AskQuestion pattern: always confirm private-per-user vs shared-across-users before writing the schema — it's a real architecture fork, not a cosmetic detail).
