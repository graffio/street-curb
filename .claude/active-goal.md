# Active Goal

**Goal:** Reorganize cli-style-validator's DSL code into clear folder structure, add naming conventions, and rename wrapper types from "Query" to descriptive names.

**Approach:**
- Phase 1: Move files to `dsl/` and `shared/` folders, update imports
- Phase 2: Add no-abbreviations rule to conventions.md
- Phase 3: Rename Query→Nodes, LineQuery→Lines, simplify SourceQuery

**Key decisions:**
- DSL code in `src/lib/dsl/`, shared utilities in `src/lib/shared/`
- Wrapper types named for what they contain (Nodes, Lines), not what they do (Query)
- Full plan in `specifications/F-ast-dsl-reorganization/plan.md`
