# cli-style-validator

Validates JavaScript/JSX files against project coding standards.

## Usage

```bash
node modules/cli-style-validator/src/cli.js <file>
```

## Output Schema

```json
{
    "filePath"   : "path/to/file.js",
    "violations" : [
        {
            "type"    : "chain-extraction",
            "line"    : 42,
            "column"  : 1,
            "priority": 1,
            "message" : "\"obj\" accessed 3 times. Consider: const { a, b, c } = obj. FIX: Add destructuring at the top of the function.",
            "rule"    : "chain-extraction"
        }
    ],
    "isCompliant": false
}
```

## Fix Order (by priority)

Fix violations in priority order — earlier fixes may resolve later ones:

| Priority | Rule(s)                                        | Why this order                                                 |
|----------|------------------------------------------------|----------------------------------------------------------------|
| 0        | cohesion-structure, export-structure            | Structural issues — address first                              |
| 1        | chain-extraction, functional-patterns           | Shortens lines → may fix line-length                           |
| 2        | single-level-indentation, react-component-cohesion | Extracts functions → may fix line-length and sig-documentation |
| 3        | line-length, multiline-destructuring            | Fix remaining after 1 and 2                                    |
| 4        | function-declaration-ordering, import-ordering  | Just reordering, no cascading effects                          |
| 5        | function-spacing                                | Just blank lines                                               |
| 6        | sig-documentation, function-naming, aboutme-comment | Documentation — depends on extraction being done first      |
| 7        | file-naming                                     | Last — changes file paths                                      |
| 8        | react-redux-separation                          | React/Redux boundary enforcement                               |

## Rules

### cohesion-structure (priority 0)

Enforces P/T/F/V/A/E cohesion group structure. Flags uncategorized functions, wrong group ordering, external function references, and vague prefixes (get/extract/derive/select/fetch).

### export-structure (priority 0)

Enforces single named export matching file name. Flags default exports, multiple exports, cohesion group leaks, and name/file mismatches.

### chain-extraction (priority 1)

Flags when `base.property` appears 3+ times in a function. Suggests destructuring.

**Does NOT flag:** Namespace imports (`import * as S from...`) — `S.foo` is not a property chain.

### functional-patterns (priority 1)

Flags imperative loop patterns (`for`, `while`, `do-while`, `for-in`, `for-of`). Allows async `for-of`.

### single-level-indentation (priority 2)

Flags multi-line anonymous functions that should be extracted to named functions.

### react-component-cohesion (priority 2)

Flags `render*` functions inside components and cohesion groups defined inside component bodies. JSX files only.

### line-length (priority 3)

Flags lines exceeding 120 characters.

**Does NOT flag:** Lines immediately following `// prettier-ignore`.

### multiline-destructuring (priority 3)

Flags multi-line destructuring patterns that should be simplified.

### function-declaration-ordering (priority 4)

Flags functions defined after their first usage point within a block.

### import-ordering (priority 4)

Flags CommonJS `require()` calls — use ES6 imports instead.

### function-spacing (priority 5)

Flags missing blank lines around multi-line functions.

### sig-documentation (priority 6)

Flags functions longer than 5 lines without `@sig` documentation. Fix single-level-indentation first — extraction creates named functions that need @sig.

### function-naming (priority 6)

Flags functions without recognized verb prefixes (is/has/to/create/check/collect/handle/etc). PascalCase names are exempt.

### aboutme-comment (priority 6)

Flags files missing two `// ABOUTME:` comment lines at the top. Test files are exempt.

### file-naming (priority 7)

- `.jsx` files exporting a single component → PascalCase matching export
- Entry points (`main.jsx`, `index.jsx`) → lowercase exception
- Multi-export utility files → kebab-case allowed

### react-redux-separation (priority 8)

Flags React hooks (useState, useMemo, useCallback, useEffect, useRef), collection methods, and spreads in component bodies. Also flags complex selectors (too long, nested conditionals, too many collection chains).
