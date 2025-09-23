# LLM Loader for A001 – JavaScript Functional Coding Standards

**CRITICAL**: Read and follow these coding standards before writing ANY code in this project.

## Top Non-Negotiables
- Pure functional code only; avoid `class`, `new`, and direct mutation—reach for helpers in `@functional` instead.
- JavaScript everywhere; TypeScript syntax, file extensions, and JSDoc typing are forbidden.
- One indentation level per function; extract helpers at the top of the local scope when complexity grows.
- TAP tests use Given/When/Then sentences with proper articles and natural language expectations.
- Document top-level or 5+ line functions with Hindley-Milner `@sig` annotations covering inputs and outputs.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines all coding rules, patterns, and constraints in structured format
3. `tests.yaml`: Optional validation examples showing compliant vs non-compliant code

**WARNING**: Ignoring these standards will result in code that violates project architecture. All code must be reviewed against logic.yaml requirements.
