# LLM Loader for F108 – Function Declaration Ordering Rule

This specification implements A001 coding standard: "DEFINE all inner functions at the top of their nearest containing block (after opening brace), before any variable declarations or other statements."

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines the AST-based rule implementation for function declaration ordering
3. `tests.yaml`: Optional validation cases to test rule correctness

This rule integrates with the existing @tools/lib/api.js coding standards checker.