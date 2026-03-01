# Financial Query Language: Surface Syntax Design

Spike 2, Step 1. Syntax design covering 4 target question types.

## Syntax Overview

```
query <name> "<description>" {
  <clauses>
}
```

Queries are named blocks containing clauses. Each clause starts with a keyword on its own line. Multi-query computations
use named sub-queries.

### Keywords

| Keyword    | Purpose                                   | Example                   |
|------------|-------------------------------------------|---------------------------|
| `from`     | Domain (transactions, accounts, holdings) | `from transactions`       |
| `where`    | Filter predicate                          | `where category = "Food"` |
| `date`     | Date range (shorthand for date filter)    | `date Q1 2025`            |
| `group by` | Grouping dimension                        | `group by month`          |
| `show`     | Output fields                             | `show total`              |
| `compare`  | Comparison computation                    | `compare q1 vs q4`        |
| `compute`  | Expression computation                    | `compute abs(a) / abs(b)` |
| `format`   | Output formatting hint                    | `format percent`          |

### Domains

- `transactions` — bank and investment transactions
- `accounts` — account entities
- `holdings` — investment positions (derived from lots + prices)

### Date Ranges

Absolute: `2025`, `Q1 2025`, `Q4 2025`, `January 2025`, `2025-01-01 to 2025-03-31`
Relative: `last 6 months`, `last quarter`, `trailing 12 months`, `this year`, `year to date`

### Filters (`where` clauses)

| Filter        | Syntax                              | Notes                                                        |
|---------------|-------------------------------------|--------------------------------------------------------------|
| Category      | `where category = "Food"`           | Prefix match: "Food" matches "Food:Dining", "Food:Groceries" |
| Account       | `where account = "Checking"`        | By name                                                      |
| Account type  | `where account type = "Bank"`       | Values from schema CHECK constraint                          |
| Payee         | `where payee = "Costco"`            | Exact or contains match                                      |
| Last activity | `where last activity > 90 days ago` | For absence queries                                          |

### Named Sub-queries

Multi-query computations reference named data sources:

```
<name>: from <domain>
        <clauses>
```

Sub-query names become variables in `compare` and `compute` clauses. Each sub-query's `total` (or other aggregated
value) is accessed as `<name>.total`.

### Grouping Dimensions

`month`, `quarter`, `year`, `category`, `account`

### Show Fields

`total` — aggregate sum of amounts
`name`, `type` — entity fields (for account/holdings queries)
`difference`, `percent_change` — comparison outputs (used with `compare`)
`last_activity` — derived field (last transaction date per account)

### Functions

`abs(<expr>)` — absolute value (normalizes sign convention: expenses are negative in raw data)

### Comments

```
-- This is a comment
```

---

## Design Decisions

**`date` as a first-class clause, not a `where`.** Date ranges are universal — nearly every query has one. Making it a
dedicated keyword keeps queries readable and avoids `where date >= "2025-01-01" and date <= "2025-03-31"` verbosity.

**Category prefix matching is implicit.** `where category = "Food"` matches "Food", "Food:Dining", "Food:Groceries".
This matches how the selector already works (spike 1 finding). No special "starts with" syntax needed.

**`compare` is sugar, `compute` is general.** `compare a vs b` is readable shorthand that auto-generates difference and
percent_change outputs. `compute` handles arbitrary expressions. Both reference named sub-queries. New computation types
can be added as functions in `compute` expressions without grammar changes.

**Grammar stability when catalog grows.** New computations = new function names usable in `compute` and `show`, not new
keywords. The grammar has generic function-call syntax (`name(args)`). Adding `median()`, `stddev()`, etc. requires no
parser changes.

**No SQL-isms.** No SELECT, no JOIN, no FROM...WHERE...GROUP BY as a fixed sequence. Financial queries aren't
relational — they're "take this domain, filter it, compute something." The clause order is flexible (though `from`
conventionally comes first).

---

## 4 Example Queries

### 1. Time Comparison — Dining Q1 vs Q4

"How much more did I spend on dining in Q1 vs Q4 2025?"

```
query dining_q1_vs_q4 "Dining: Q1 vs Q4 2025" {
  q1: from transactions
      where category = "Food:Dining"
      date Q1 2025

  q4: from transactions
      where category = "Food:Dining"
      date Q4 2025

  compare q1 vs q4
  show total, difference, percent_change
}
```

**IR mapping:** Two transaction queries filtered by category + date range, combined with `compare` computation. Outputs
both totals plus derived difference and percent_change.

### 2. Cross-Category Ratio — Food as % of Income

"What percentage of my income goes to food?"

```
query food_pct_of_income "Food as % of income" {
  food: from transactions
        where category = "Food"
        date 2025

  income: from transactions
          where category = "Income"
          date 2025

  compute abs(food.total) / abs(income.total)
  format percent
}
```

**IR mapping:** Two transaction queries (food expenses, income), combined with `expression` computation. `abs()`
normalizes sign convention (expenses are negative, income is positive). `format percent` tells the result view to
display as "X%".

### 3. Monthly Trend — Food by Month

"Show me food spending by month for the last 6 months."

```
query food_by_month "Monthly food spending" {
  from transactions
  where category = "Food"
  date last 6 months
  group by month
  show total
}
```

**IR mapping:** Single transaction query with category filter, date range, and `group by month`. The execution engine
returns a series of monthly totals — one row per month. Result view: table or time series chart.

### 4. Absence Query — Inactive Accounts

"Which accounts haven't had activity in 90 days?"

```
query inactive_accounts "Accounts with no recent activity" {
  from accounts
  where last activity > 90 days ago
  show name, type, last_activity
}
```

**IR mapping:** Account domain query with a derived filter (`last activity > 90 days ago` means "last transaction date
is more than 90 days in the past"). The execution engine computes last_activity per account from the transactions table.
This is a `filter_entities` computation — filter accounts by a derived predicate.

---

## IR Data Structure

The IR (Internal Representation) is the data structure the parser emits and the execution engine consumes. It's
declarative — describes *what* to compute, not *how*. Based on spike 1's JSON spec, cleaned up.

### Top-level: QueryIR

```
{
  name: String,              // identifier (from query block name)
  description: String,       // human label (from quoted string after name)
  sources: {                 // 1+ named data sources
    [name]: Source            // key = sub-query name, or '_default' for single-source queries
  },
  computation: Computation,  // how to combine source results
  output: Output             // what to display and how
}
```

### Source

Each source targets a domain with optional filters, date range, and grouping.

```
{
  domain: 'transactions' | 'accounts' | 'holdings',
  filters: [Filter],        // zero or more, all must match (AND)
  dateRange: DateRange,      // optional — accounts/holdings may omit
  groupBy: GroupDimension    // optional — produces series instead of scalar
}
```

### Filter

Filters narrow a source. Each has a field, operator, and value.

```
// Category (prefix match: "Food" matches "Food:Dining", "Food:Groceries")
{ field: 'category', op: 'eq', value: 'Food' }

// Account (by name)
{ field: 'account', op: 'eq', value: 'Checking' }

// Account type (exact match against schema CHECK constraint values)
{ field: 'accountType', op: 'eq', value: 'Bank' }

// Payee
{ field: 'payee', op: 'eq', value: 'Costco' }

// Last activity — derived filter (last transaction date older than N days)
{ field: 'lastActivity', op: 'olderThan', value: { days: 90 } }
```

`op` is always `'eq'` for now except `lastActivity` which uses `'olderThan'`. This leaves room for
`'neq'`, `'in'`, `'contains'` later (see Open Questions).

### DateRange

```
// Absolute year
{ type: 'year', year: 2025 }

// Absolute quarter
{ type: 'quarter', quarter: 1, year: 2025 }

// Absolute month
{ type: 'month', month: 1, year: 2025 }

// Explicit range (ISO date strings)
{ type: 'range', start: '2025-01-01', end: '2025-03-31' }

// Relative count
{ type: 'relative', unit: 'months' | 'quarters' | 'years', count: 6 }

// Named relative
{ type: 'named', name: 'this_year' | 'year_to_date' | 'last_quarter' | 'trailing_12_months' }
```

### GroupDimension

One of: `'month'` | `'quarter'` | `'year'` | `'category'` | `'account'`

When present, the source produces a series (one row per group) instead of a scalar aggregate.

### Computation

Describes how to combine source results into the final output.

```
// Identity — single source, pass through (trend, simple list)
{ type: 'identity', source: '_default' }

// Compare — two sources, emit totals + difference + percent_change
{ type: 'compare', left: 'q1', right: 'q4' }

// Expression — arbitrary math on source fields
{ type: 'expression', expr: Expr }

// Filter entities — filter domain entities by a derived predicate
// (the filters on the source already encode the predicate; this tells
// the engine the result is a filtered entity list, not an aggregate)
{ type: 'filter_entities', source: '_default' }
```

**Spike 1 had 7 types.** This IR collapses `ratio` and `aggregate_sum` into `expression` (they're just
arithmetic on source totals). `statistical` is deferred — it would be an `expression` with stats functions
when the function registry grows. Four computation types cover the 4 example queries cleanly.

### Expr (expression AST)

Used in `expression` computations. A tree of nodes:

```
// Reference a source's aggregated field
{ type: 'ref', source: 'food', field: 'total' }

// Literal number
{ type: 'literal', value: 100 }

// Binary operation
{ type: 'binary', op: '+' | '-' | '*' | '/', left: Expr, right: Expr }

// Function call (abs, etc. — extensible via function registry)
{ type: 'call', fn: 'abs', args: [Expr] }
```

### Output

```
{
  show: ['total', 'difference', 'percent_change'],  // fields to display (optional)
  format: 'percent' | 'currency'                    // formatting hint (optional)
}
```

`show` fields depend on computation type:
- **identity** with groupBy: `total` (per group)
- **identity** without groupBy: entity fields (`name`, `type`, `last_activity`)
- **compare**: `total`, `difference`, `percent_change`
- **expression**: result is a single scalar (format determines display)
- **filter_entities**: entity fields (`name`, `type`, `last_activity`)

---

## 4 Example Queries → IR

### 1. Dining Q1 vs Q4

```
{
  name: 'dining_q1_vs_q4',
  description: 'Dining: Q1 vs Q4 2025',
  sources: {
    q1: {
      domain: 'transactions',
      filters: [{ field: 'category', op: 'eq', value: 'Food:Dining' }],
      dateRange: { type: 'quarter', quarter: 1, year: 2025 }
    },
    q4: {
      domain: 'transactions',
      filters: [{ field: 'category', op: 'eq', value: 'Food:Dining' }],
      dateRange: { type: 'quarter', quarter: 4, year: 2025 }
    }
  },
  computation: { type: 'compare', left: 'q1', right: 'q4' },
  output: { show: ['total', 'difference', 'percent_change'] }
}
```

### 2. Food as % of Income

```
{
  name: 'food_pct_of_income',
  description: 'Food as % of income',
  sources: {
    food: {
      domain: 'transactions',
      filters: [{ field: 'category', op: 'eq', value: 'Food' }],
      dateRange: { type: 'year', year: 2025 }
    },
    income: {
      domain: 'transactions',
      filters: [{ field: 'category', op: 'eq', value: 'Income' }],
      dateRange: { type: 'year', year: 2025 }
    }
  },
  computation: {
    type: 'expression',
    expr: {
      type: 'binary',
      op: '/',
      left: { type: 'call', fn: 'abs', args: [{ type: 'ref', source: 'food', field: 'total' }] },
      right: { type: 'call', fn: 'abs', args: [{ type: 'ref', source: 'income', field: 'total' }] }
    }
  },
  output: { format: 'percent' }
}
```

### 3. Food by Month

```
{
  name: 'food_by_month',
  description: 'Monthly food spending',
  sources: {
    _default: {
      domain: 'transactions',
      filters: [{ field: 'category', op: 'eq', value: 'Food' }],
      dateRange: { type: 'relative', unit: 'months', count: 6 },
      groupBy: 'month'
    }
  },
  computation: { type: 'identity', source: '_default' },
  output: { show: ['total'] }
}
```

### 4. Inactive Accounts

```
{
  name: 'inactive_accounts',
  description: 'Accounts with no recent activity',
  sources: {
    _default: {
      domain: 'accounts',
      filters: [{ field: 'lastActivity', op: 'olderThan', value: { days: 90 } }]
    }
  },
  computation: { type: 'filter_entities', source: '_default' },
  output: { show: ['name', 'type', 'last_activity'] }
}
```

---

## IR Design Decisions

**`_default` for single-source queries.** When a query has no named sub-queries, the source key is `_default`.
The parser assigns this automatically. Multi-source queries use the explicit sub-query names from the surface syntax.

**`compare` stays as its own computation type.** It could be desugared into an expression
(`{ op: '-', left: ref(q1.total), right: ref(q4.total) }`), but keeping it as a distinct type lets the execution
engine produce both `difference` and `percent_change` outputs, and lets the result view render a comparison layout.

**`ratio` collapsed into `expression`.** Spike 1 had `ratio` as a separate computation type. But `abs(a) / abs(b)`
is just an expression — no special handling needed. The expression AST is general enough.

**`filter_entities` is about result shape, not computation.** All sources have filters. The difference is: `identity`
returns aggregated numbers, `filter_entities` returns a list of entities that passed the filter. This tells the
execution engine (and result view) what kind of output to produce.

**Expression AST is minimal.** Four node types: `ref`, `literal`, `binary`, `call`. This covers arithmetic on source
totals with function calls. New functions (median, stddev, etc.) just need new `fn` names — no AST changes.

**Filters are AND-only for now.** Multiple filters on a source are all required to match. OR logic and negation are
deferred (see Open Questions).

---

## Open Syntax Questions (for later steps)

- **Multi-value filters:** `where category in ("Food:Dining", "Food:Groceries")` — list syntax?
- **Negation:** `where category != "Transfers"` — needed for excluding transfer transactions
- **Account type values:** Should we accept the exact CHECK constraint strings ("Bank", "Credit Card", "401(k)/403(b)")
  or friendlier aliases?
- **Multiple group-by:** `group by month, category` — cross-tabulation
- **Expression scope:** Keep it minimal (arithmetic + `abs`) for now. `median()`, `percentile()`, etc. come from the
  computation registry later.
- **String matching:** `where payee contains "Amazon"` vs exact match — needed?
