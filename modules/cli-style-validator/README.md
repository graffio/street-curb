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

Fix violations in priority order - earlier fixes may resolve later ones:

| Priority | Rule                          | Why this order                                                 |
|----------|-------------------------------|----------------------------------------------------------------|
| 1        | chain-extraction              | Shortens lines → may fix line-length                           |
| 2        | single-level-indentation      | Extracts functions → may fix line-length and sig-documentation |
| 3        | line-length                   | Fix remaining after 1 and 2                                    |
| 4        | function-declaration-ordering | Just reordering, no cascading effects                          |
| 5        | function-spacing              | Just blank lines                                               |
| 6        | sig-documentation             | Depends on extraction being done first                         |
| 7        | file-naming                   | Last - changes file paths                                      |

## Rules

### chain-extraction (priority 1)

Flags when `base.property` appears 3+ times in a function. Suggests destructuring.

**Does NOT flag:** Namespace imports (`import * as S from...`) - `S.foo` is not a property chain.

### single-level-indentation (priority 2)

Flags multi-line anonymous functions that should be extracted to named functions.

**Message format:**

```
Extract multi-line unnamed function to a named function.
FIX: Move the callback body to a named function defined above.
For Promise executors: extract to a function that receives resolve/reject as parameters.
For .map() callbacks: if it doesn't fit on one line with .map(), extract it.
```

### line-length (priority 3)

Flags lines exceeding 120 characters.

**Does NOT flag:** Lines immediately following `// prettier-ignore`.

### function-declaration-ordering (priority 4)

Flags functions defined after their first usage point within a block.

**Message format:**

```
Arrow function 'handleClick' must be defined before hooks.
FIX: Move the function definition above the first useSelector/useState call.
Safe because: closures capture variable bindings, not values - variables will be initialized before the function is called.
```

### function-spacing (priority 5)

Flags missing blank lines around multi-line functions.

### sig-documentation (priority 6)

Flags functions longer than 5 lines without `@sig` documentation.

**Note:** If the function is an inline callback (Promise executor, .map callback), fix single-level-indentation first -
extraction will create a named function that needs @sig.

### file-naming (priority 7)

- `.jsx` files exporting a single component → PascalCase matching export
- Entry points (`main.jsx`, `index.jsx`) → lowercase exception
- Multi-export utility files → kebab-case allowed
