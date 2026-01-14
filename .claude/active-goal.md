# Active Goal: BLOCKED - cli-qif-to-sqlite Never Worked

**Status:** Blocked pending decision on approach

**Discovery:** The module has never successfully imported a real QIF file. All 273+ tests pass because they use pre-formatted test data (strings) that bypasses the actual parser-to-database pipeline.

**Root Causes:**
1. Tests use `date: '2024-01-15'` (string) but parser produces `date: new Date(...)` (Date object)
2. cli.js was transforming types before Tagged type validation
3. Signatures computed differently with typed vs string data
4. `INSERT OR IGNORE` hid constraint violations silently
5. Schema transactionType CHECK doesn't match QIF transaction types

**See:** `specifications/F-stable-qif-import/retrospective.md` for full analysis

**Pending Decision:**
- Fix existing module vs. start fresh?
- Rewrite specs from reality vs. fix specs to match code?
- What's the minimum viable feature set?

**Next Action:** User decision required on approach
