# Claude Generation Test Results

Spike 2, Step 5. Testing whether Claude can produce parseable, semantically correct queries given schema + syntax reference + examples.

## Setup

- **Model:** Claude Haiku 4.5 (subagent with no prior context)
- **Prompt:** Schema summary (tables, types, conventions) + syntax reference (keywords, date ranges, filters, sub-queries) + 4 example queries with natural language question → surface syntax mapping
- **Prompt size:** ~180 lines (markdown)
- **Test:** 4 NEW natural language questions not in the examples

## Results

| # | Question | Parse | Semantic | Notes |
|---|----------|-------|----------|-------|
| 1 | "How does my entertainment spending compare quarter by quarter in 2025?" | PASS | PASS | Correctly chose `group by quarter` over `compare` — understood "compare quarter by quarter" means trend, not two-quarter comparison |
| 2 | "What percentage of my income went to housing costs last year?" | PASS | PASS | Correct sub-query pattern, `abs()` on both sides, `format percent`. Resolved "last year" to 2025. |
| 3 | "Show me how much I spent at Costco each month this year." | PASS | PASS | Used `where payee = "Costco"` + `date this year` + `group by month` — all correct |
| 4 | "Which of my credit card accounts have been inactive for over 60 days?" | PASS | PASS | Combined `where account type = "Credit Card"` + `where last activity > 60 days ago` — both filters correct, correct domain (`accounts`) |

**Summary: 4/4 parseable, 4/4 semantically correct**

## What the test covered

- **Trend query** (Q1) — single source with group-by, different from comparison examples
- **Ratio query** (Q2) — cross-category ratio, structurally similar to example #2 but different categories
- **Payee filter + relative date** (Q3) — payee filter not used in any example; `this year` relative date
- **Combined filters on accounts domain** (Q4) — two filters on same source, account type + last activity

## Observations

1. **Haiku was sufficient.** Even the cheapest/fastest model produced perfect results with adequate prompt context. This suggests the syntax is learnable from examples alone.

2. **Semantic disambiguation worked.** "Compare quarter by quarter" could be misread as a `compare` clause, but Claude correctly chose `group by quarter` with a single source. This is the right interpretation — the user wants a trend, not a two-quarter diff.

3. **Filter composition was correct.** Query #4 required two `where` clauses on the same source. Claude stacked them correctly, matching the parser's AND semantics.

4. **Convention adherence.** Claude used `abs()` for the ratio query (Q2) without being told explicitly — it picked up the sign convention from the schema summary and examples.

5. **Date resolution.** "Last year" → `date 2025` and "this year" → `date this year` — both reasonable. The model resolved the ambiguous "last year" to a concrete year.

## Limitations of this test

- **Only 4 queries** — a production evaluation would need 20-50 covering edge cases
- **No adversarial questions** — didn't test ambiguous, unanswerable, or out-of-scope questions
- **No semantic validation** — queries reference categories like "Entertainment" and "Housing" that may not exist in a given user's data. The parser can't check this; a validation layer would.
- **Haiku had system context** — the subagent had system-level date awareness (Feb 2026), which helped resolve "last year" to 2025. A raw API call might not have this.
- **No multi-turn** — didn't test clarification dialogues ("What do you mean by housing?")

## Files

- `modules/quicken-web-app/src/query-language/claude-generation-prompt.md` — the prompt given to Claude
- `modules/quicken-web-app/src/query-language/claude-generation-test.js` — test script with generated queries, expected IR, and parser validation
