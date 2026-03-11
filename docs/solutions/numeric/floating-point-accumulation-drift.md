---
category: numeric
tags: [floating-point, accumulation, financial-math, precision, kahan]
created: 2026-03-11
symptoms:
  - Dollar totals differ by ~$0.01 from SQL SUM fixtures
  - Drift worsens with more transactions in a group
  - Integration tests exclude specific date-points to avoid assertion failures
---

# Floating-Point Accumulation Drift

## Solution

Replace `reduce((sum, t) => sum + t.amount, 0)` with `sumCompensated` from `@graffio/functional` at
all monetary accumulation sites. Kahan compensated summation tracks rounding error in a compensation
variable and folds it back on each addition. Error stays O(epsilon) regardless of array length.

```js
import { sumCompensated, map } from '@graffio/functional'

// Before: drifts ~1 cent over hundreds of transactions
const total = transactions.reduce((sum, t) => sum + t.amount, 0)

// After: exact to ~15 significant digits
const total = sumCompensated(map(t => t.amount, transactions))
```

For conditional accumulation (date-filtered, cash-only), use `compactMap`:
```js
const total = sumCompensated(compactMap(t => t.date <= date ? t.amount : undefined, transactions))
```

## Prevention

- Use `sumCompensated` for any reduce-to-sum over monetary or quantity fields
- Plain `+` is fine for combining two pre-compensated sums (2-value addition has no drift)
- Plain `reduce` is fine for integer counts (integers don't drift)

## Key Decisions

- **Kahan over big.js** — the problem is summation-only; a decimal library is overkill
- **Promoted to @graffio/functional** — type definition source files import from functional,
  so the utility must live there (not in query-language)
- **Excluded compute-irr.js** — Newton's method has 1e-12 convergence tolerance; Kahan won't
  meaningfully change convergence behavior
- **Excluded compute-realized-gains.js** — object accumulation over few items per lot (1-5);
  drift risk is negligible
- **pushToKey arg order** — signature is `(obj, key, item)`, not `(key, item, obj)`

## Problem

JS `reduce((sum, t) => sum + t.amount, 0)` over hundreds of float64 values accumulates IEEE 754
rounding error proportional to array length (O(n * epsilon)). When the cumulative error crosses
the 0.5-cent threshold, formatted dollar values shift by $0.01 vs SQL `SUM()` which accumulates
in a different order with different intermediate rounding.

Visible in integration tests: 4 of 12 monthly net-worth snapshot dates drifted and were excluded
from assertions via an `fpDriftDates` set.

## Root Cause

IEEE 754 float64 has ~15-16 significant digits. When adding a small value to a large running sum,
the small value's low-order bits are dropped. Over hundreds of additions, these lost bits accumulate.
Kahan summation recovers the exact rounding error of each addition (`(newSum - sum) - adjusted`)
and compensates on the next step.
