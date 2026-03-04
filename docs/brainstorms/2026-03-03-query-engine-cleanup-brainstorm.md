---
date: 2026-03-03
topic: query-engine-cleanup
depends-on: 2026-02-27-claude-financial-assistant-brainstorm.md
---

# Query Engine Cleanup: DSL Removal, Type Consolidation, Codegen Improvements

## What We're Building

Cleanup and restructuring of the query engine type system and infrastructure before Plan C (investment analysis).
Six changes that reduce complexity, remove dead code, and tighten the type definitions.

## Why This Matters

The query engine (Plan A) was built with a DSL parser layer that has no consumer — Claude constructs IR directly from
natural language. The parser adds ~600 lines of maintenance burden and every new feature (order by, limit, metrics, time
series) requires parser changes. Meanwhile, the type definitions have inconsistent naming, loose `String` fields, inline
regexes, and a stale module boundary (`quicken-type-definitions`). The generated type code includes Firestore
serialization that only curb-map uses, adding dead code to every other module.

Cleaning this up now, before Plan C adds investment features to the IR, avoids compounding the mess.

## Settled Decisions

| Decision                                                  | Rationale                                                                                                                                                                                                                                                                                                       |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Drop the DSL parser entirely                              | Claude is the query author, not humans. No text-based query editor exists or is planned. Claude constructs IR Tagged values directly from natural language. The parser is a layer with no consumer.                                                                                                             |
| IR prefix for query engine types                          | Rename: QuerySource → IRSource, QueryFilter → IRFilter, QueryOutput → IROutput, QueryResult → IRResult, QueryIR → IR (or IRQuery). Add prefix to types that lacked it: Computation → IRComputation, ExpressionNode → IRExpression, DateRange → IRDateRange, Domain → IRDomain. Clear, consistent, no ambiguity. |
| Keep type-definitions flat                                | The type generator can't resolve cross-directory imports. Rather than fix the generator, the IR prefix provides sufficient grouping. All quicken-web-app type definitions stay in one directory.                                                                                                                |
| Consolidate quicken-type-definitions into quicken-web-app | The `modules/quicken-type-definitions/` module only targets quicken-web-app (the `qifAndWeb` alias is a stale single-element array from when cli-qif-to-sqlite-with-overwrite was removed). Move all 10 entity type files, merge field-types.js (6 entity ID regexes), remove the module, inline the mappings.  |
| Firestore codegen: global default off, opt-in             | Only curb-map uses Firestore serialization. Add a `firestore: true` field to type definitions that need it. Default is no Firestore code generation. Update cli-type-generator test expectations to match.                                                                                                      |
| Tighten loose String fields                               | Replace generic `'String'` with regexes or FieldTypes references where the value set is known. Priority targets: IRFilter.Equals.field, IRFilter.OlderThan.field, IRResult.*.source → FieldTypes.sourceName, IRExpression.Call.fn.                                                                              |
| Move inline regexes to FieldTypes                         | Named entries instead of inline patterns: IRExpression.Binary.op → FieldTypes.arithmeticOp, IRDateRange.Relative.unit → FieldTypes.timeUnit, IRDateRange.Named.name → FieldTypes.namedPeriod, AccountSummary.type → FieldTypes.accountType.                                                                     |
| Defer investment IR extensions to Plan C                  | New fields (metrics, orderBy, limit, timeSeries) designed during Plan C after the position enrichment spike validates the data model. This brainstorm handles cleanup only.                                                                                                                                     |

## Scope

### In scope

1. **Delete the parser** — Remove `query-parser.js` and its tests. Remove any code that calls it.
2. **Rename IR types** — All query engine types get `IR` prefix. Update type definitions, generated types, all
   imports and references throughout src/.
3. **Consolidate quicken-type-definitions** — Move entity types into quicken-web-app/type-definitions/, merge
   field-types.js, update type-mappings.js, delete the module.
4. **Firestore codegen flag** — Add opt-in `firestore: true` to type definitions. Update generator to skip
   Firestore code by default. Add flag to curb-map types. Update generator tests.
5. **Tighten String fields** — Replace generic Strings with regexes/FieldTypes where value set is known.
6. **Move inline regexes to FieldTypes** — Extract named entries for reusable patterns.

### Out of scope

- Investment IR extensions (Plan C)
- Type definition subdirectories (generator limitation accepted)
- Fixing the generator's cross-directory import resolution
- Any UI changes

## Rename Map

| Current          | New                                                    |
|------------------|--------------------------------------------------------|
| `QueryIR`        | `Query` (root type — the query itself)                 |
| `QuerySource`    | `IRSource`                                             |
| `QueryFilter`    | `IRFilter`                                             |
| `QueryOutput`    | `IROutput`                                             |
| `QueryResult`    | `IRResult`                                             |
| `Computation`    | `IRComputation`                                        |
| `ExpressionNode` | `IRExpression`                                         |
| `DateRange`      | `IRDateRange`                                          |
| `Domain`         | `IRDomain`                                             |
| `DataSummary`    | Keep (not an IR node — validation input)               |
| `AccountSummary` | Keep (not an IR node — part of DataSummary)            |
| `ResultTree`     | `IRResultTree`                                         |

## New FieldTypes Entries

```
arithmeticOp : /^[/+*-]$/,
timeUnit     : /^(months|days|weeks|years)$/,
namedPeriod  : /^(last_quarter|last_month|last_year|this_quarter|this_month|this_year|year_to_date)$/,
accountType  : /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/,
```

Single-consumer regexes (filterField, builtinFunction) stay inline in the type definition — no FieldTypes entry needed.

## Knowledge Destination

| Destination                                                            | Content                                                                                 |
|------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| `architecture:` docs/architecture/financial-query-language.md (update) | Remove DSL/parser references, document IR-direct construction model, updated type names |
| `decisions:` append                                                    | DSL removal rationale, IR prefix naming convention, Firestore codegen default           |

## Open Questions

None — all resolved during brainstorming.
