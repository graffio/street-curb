# Tagged Type Quick Reference

This guide explains how to define and use tagged/union types with the generator in `modules/cli-type-generator`.

## 1. Workflow overview

1. Add or edit a definition in `type-definitions/*.type.js` inside the owning package (for example
   `modules/curb-map/type-definitions/result.type.js`).
2. Run `yarn types:generate` (or `yarn types:watch`) to regenerate the corresponding module at the path listed in
   `modules/cli-type-generator/type-mappings.js` (for curb-map types that is `modules/curb-map/src/types/*.js`).
3. Import constructors from the generated module and call them without `new`.

## 2. Definition syntax

Definition files export plain objects; the generator wires in constructors/toString/match helpers.

### Tagged (single constructor)

```js
// modules/.../type-definitions/coord.type.js
export const Coord = {
    name: 'Coord',
    kind: 'tagged',
    fields: { x: 'Number', y: 'Number' },
}
```

### Tagged sum (union of constructors)

```js
// modules/.../type-definitions/shape.type.js
export const Shape = {
    name: 'Shape',
    kind: 'taggedSum',
    variants: {
        Square: { topLeft: 'Coord', bottomRight: 'Coord' },
        Circle: { centre: 'Coord', radius: 'Number' },
    },
}
```

Field expressions may reference primitives, other tagged types, regexes, arrays, LookupTables, or optionals:

| Pattern                                         | Meaning                          | Example                   |
|-------------------------------------------------|----------------------------------|---------------------------|
| `'Number'`, `'String'`, `'Boolean'`, `'Object'` | Primitive fields                 | `x: 'Number'`             |
| `'Date'`                                        | Date field                       | `createdAt: 'Date'`       |
| `'Type'`                                        | Reference to another tagged type | `centre: 'Coord'`         |
| `'Type?'`                                       | Optional field (any type)        | `description: 'String?'`  |
| `'{Type:idField}'`                              | LookupTable (preferred for collections) | `members: '{User:id}'` |
| `'[Type]'`, `'[[Type]]'`, …                     | Arrays / nested arrays           | `rows: '[[Number]]'`      |
| `/regexp/`                                      | Regex string validation          | `id: /^[0-9a-f-]{36}$/i`  |

**Note:** Prefer LookupTable (`{Type:idField}`) over arrays when items have unique IDs. LookupTables provide O(1) lookup by ID and integrate with `@graffio/functional`.

Other (test) examples in the repo:

- Optional: `HasId = { name: 'HasId', kind: 'tagged', fields: { description: 'String?' } }`
- Regex: `HasIdEnhanced = { name: 'HasIdEnhanced', kind: 'tagged', fields: { id: /^[0-9a-f-]{36}$/i } }`
- Nested arrays: `DoubleNestedArray = { name: 'DoubleNestedArray', kind: 'tagged', fields: { data: '[[Number]]' } }`
- Recursive sum: `OperationDetails = { name: 'OperationDetails', kind: 'taggedSum', variants: { … } }`

## 3. Running the generator

```bash
yarn types:generate
```

The generator scans all definition files, writes the corresponding modules to the mapped output directories, and updates
the index. Commit both the definition and the regenerated files.

## 4. Using generated constructors

```js
import { Coord } from './src/types/coord.js'
import { Shape } from './src/types/shape.js'

const origin = Coord(0, 0)
const square = Shape.Square(Coord(0, 0), Coord(4, 4))
```

Notes:

- Constructors accept positional arguments in the order declared. For example `Coord(0, 0)` and
  `Shape.Square(Coord(0, 0), Coord(4, 4))` correspond to the field order in the definition.
- Every constructor also exposes a `.from({ … })` helper for named arguments, e.g.
  `Shape.Square.from({ topLeft: Coord(0, 0), bottomRight: Coord(4, 4) })`.
- Predicate helpers: `Shape.is(value)` and `Shape.Square.is(value)`.
- Pattern matching: `value.match({ [constructorName]: handler, … })` returns the handler result.
- `toString()` reflects the constructor/fields for easier debugging.

## 5. Result example (success/failure)

```js
// modules/curb-map/type-definitions/result.type.js
export const Result = {
    name: 'Result',
    kind: 'taggedSum',
    variants: {
        Success: { value: 'Object' },
        Failure: {
            originalError: 'Object',
            statusCode: 'Number?',
            reason: 'String?',
        },
    },
}
```

Usage:

```js
import { Result } from './src/types/result.js'

const success = Result.Success({})
const failure = Result.Failure(new Error('denied'), 403, 'permission-denied')

if (Result.Success.is(success)) {
    // handle success
}

// note: `result` is available to the Failure function from the function's parameter
const doSomething = result =>
    result.match({
        Success: ({ value }) => { itWorked(value) },
        Failure: ({ originalError, statusCode, reason }) => { itFailed(result) },
    })
```

## 6. Common pitfalls

- Forgetting to run the generator after editing `.type.js` files.
- Importing from the definition instead of the generated module listed in `type-mappings.js`.
- Using `new` with constructors.
- Omitting the `?` suffix for optional fields.

Keep this workflow in mind whenever you introduce or update tagged types: edit the definition, regenerate, and commit
both the definition and the generated module.

## 7. Implementation architecture

The generator separates concerns into three layers: **parsing**, **codegen modules**, and **orchestration**.

### Directory structure

```
src/
├── cli.js                      # Entry point
├── cli-api.js                  # Commands: generate, generate-all, watch
├── parse-type-definition-file.js  # Parser: reads .type.js → TypeDescriptor
├── tagged-type-generator.js    # Orchestrator: assembles output from codegen modules
├── tagged-type-function-generators.js  # Low-level: constructor bodies, type checks
├── prettier-code.js            # Formatting utilities
├── descriptors/
│   ├── field-descriptor.js     # Normalized field type representation
│   └── type-descriptor.js      # Normalized type definition representation
└── codegen/
    ├── to-string.js            # toString method generation
    ├── to-json.js              # toJSON method generation
    ├── serialization.js        # Firestore toFirestore/fromFirestore expressions
    ├── is-method.js            # TaggedSum .is() method
    ├── imports.js              # Import statement generation
    └── constructor-sig.js      # @sig JSDoc comments for constructors
```

### Data flow

```
.type.js file
    ↓
parse-type-definition-file.js
    ↓
TypeDescriptor (normalized)
    ↓
tagged-type-generator.js (orchestrator)
    ├── calls codegen/* modules for each concern
    ├── calls tagged-type-function-generators.js for constructor bodies
    └── assembles sections in order
    ↓
prettier-code.js
    ↓
.js output file
```

### FieldDescriptor schema

All field types normalize to this structure at parse time:

```js
{
    baseType: 'String' | 'Number' | 'Boolean' | 'Object' | 'Date' | 'Any' | 'Tagged' | 'LookupTable',
    optional: false,           // trailing ? in syntax
    arrayDepth: 0,             // nesting level: '[Type]' = 1, '[[Type]]' = 2
    taggedType: null,          // 'Account' for Tagged/LookupTable fields
    idField: null,             // 'id' for LookupTable fields
    regex: null,               // /pattern/ for regex-validated strings
    fieldTypesReference: null  // { property, fullReference } for FieldTypes.X
}
```

`FieldDescriptor.fromAny(input)` accepts strings (`'String?'`), regexes (`/pattern/`), or objects and returns this normalized form. `FieldDescriptor.toSyntax(descriptor)` converts back to concise syntax for display.

### TypeDescriptor schema

```js
// Tagged type
{
    kind: 'Tagged',
    name: 'Account',
    relativePath: 'modules/.../account.type.js',
    fields: { id: FieldDescriptor, name: FieldDescriptor, ... },
    childTypes: ['Category'],      // types needing import
    needsLookupTable: false,
    imports: [...],                // preserved from source
    functions: [...]               // preserved from source
}

// TaggedSum type
{
    kind: 'TaggedSum',
    name: 'Action',
    relativePath: '...',
    variants: {
        Created: { fields: {...}, childTypes: [] },
        Updated: { fields: {...}, childTypes: [] }
    },
    needsLookupTable: false,
    imports: [...],
    functions: [...]
}
```

### Codegen module pattern

Each module in `src/codegen/` exports pure functions that take descriptor data and return code strings:

```js
// codegen/to-string.js
const generateNamedToString = (funcName, typeName, fields) => `...`

// codegen/serialization.js
const generateToFirestoreValue = (fieldName, fieldType) => `...`
const generateFromFirestoreField = (fieldName, fieldType) => `...`
```

The orchestrator (`tagged-type-generator.js`) calls these modules and assembles the output in the correct order.

### Firestore serialization

Generated types include `toFirestore` and `fromFirestore` methods that handle:
- **Date fields**: encode/decode via passed timestamp functions
- **Tagged fields**: call nested `Type.toFirestore()`/`Type.fromFirestore()`
- **LookupTable fields**: serialize as `{ id: fullObject }` maps for efficient Firestore queries
- **Arrays of Tagged**: recursive `.map()` calls at each nesting level

The underscore-prefix pattern (`_toFirestore`, `_fromFirestore`) allows types to define custom public methods that delegate to the generated ones.

### Key design decisions

1. **Normalize early**: Parse once to descriptors, generate from descriptors. No re-parsing during codegen.
2. **Separate concerns**: Each codegen module handles one output section.
3. **Orchestrator assembles**: `tagged-type-generator.js` calls modules and concatenates results.
4. **Preserve user code**: `imports` and `functions` from source files pass through unchanged.
5. **No runtime dependency on generator**: Generated code imports only `@graffio/cli-type-generator` runtime helpers.

### Future capabilities (enabled by this architecture)

- **Phase 4**: Reorganize TaggedSum output (group by concern, not by variant)
- **Phase 5**: Default values for optional fields in `from()`
