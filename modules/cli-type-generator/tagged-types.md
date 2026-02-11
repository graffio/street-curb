# Type Generator Architecture

Implementation internals for the tagged type generator. For usage guide (defining types, running the generator, using constructors), see `docs/tagged-types.md`.

---

The generator separates concerns into three layers: **parsing**, **codegen modules**, and **orchestration**.

## Directory structure

```
src/
├── cli.js                      # Entry point
├── cli-api.js                  # Commands: generate, generate-all, watch
├── parse-type-definition-file.js  # Parser: reads .type.js → TypeDescriptor
├── tagged-type-generator.js    # Orchestrator: assembles output from codegen modules
├── prettier-code.js            # Formatting utilities
├── descriptors/
│   ├── field-descriptor.js     # Normalized field type representation
│   └── type-descriptor.js      # Normalized type definition representation
└── codegen/
    ├── expressions.js          # Constructor bodies, type checks, from() functions
    ├── to-string.js            # toString method generation
    ├── to-json.js              # toJSON method generation
    ├── serialization.js        # Firestore toFirestore/fromFirestore expressions
    ├── is-method.js            # TaggedSum .is() method
    ├── imports.js              # Import statement generation
    └── constructor-sig.js      # @sig JSDoc comments for constructors
```

## Data flow

```
.type.js file
    ↓
parse-type-definition-file.js
    ↓
TypeDescriptor (normalized)
    ↓
tagged-type-generator.js (orchestrator)
    ├── calls codegen/* modules for each concern
    └── assembles sections in order
    ↓
prettier-code.js
    ↓
.js output file
```

## FieldDescriptor schema

All field types normalize to this structure at parse time:

```js
{
    baseType: 'String' | 'Number' | 'Boolean' | 'Object' | 'Date' | 'Any' | 'Tagged' | 'LookupTable',
        optional
:
    false,           // trailing ? in syntax
        arrayDepth
:
    0,             // nesting level: '[Type]' = 1, '[[Type]]' = 2
        taggedType
:
    null,          // 'Account' for Tagged/LookupTable fields
        idField
:
    null,             // 'id' for LookupTable fields
        regex
:
    null,               // /pattern/ for regex-validated strings
        fieldTypesReference
:
    null  // { property, fullReference } for FieldTypes.X
}
```

`FieldDescriptor.fromAny(input)` accepts strings (`'String?'`), regexes (`/pattern/`), or objects and returns this
normalized form. `FieldDescriptor.toSyntax(descriptor)` converts back to concise syntax for display.

## TypeDescriptor schema

```js
// Tagged type
{
    kind: 'Tagged',
        name
:
    'Account',
        relativePath
:
    'modules/.../account.type.js',
        fields
:
    {
        id: FieldDescriptor, name
    :
        FieldDescriptor,
    ...
    }
,
    childTypes: ['Category'],      // types needing import
        needsLookupTable
:
    false,
        imports
:
    [...],                // preserved from source
        functions
:
    [...]               // preserved from source
}

// TaggedSum type
{
    kind: 'TaggedSum',
        name
:
    'Action',
        relativePath
:
    '...',
        variants
:
    {
        Created: {
            fields: {...}
        ,
            childTypes: []
        }
    ,
        Updated: {
            fields: {...}
        ,
            childTypes: []
        }
    }
,
    needsLookupTable: false,
        imports
:
    [...],
        functions
:
    [...]
}
```

## Codegen module pattern

Each module in `src/codegen/` exports pure functions that take descriptor data and return code strings:

```js
// codegen/to-string.js
const generateNamedToString = (funcName, typeName, fields) => `...`

// codegen/serialization.js
const generateToFirestoreValue = (fieldName, fieldType) => `...`
const generateFromFirestoreField = (fieldName, fieldType) => `...`
```

The orchestrator (`tagged-type-generator.js`) calls these modules and assembles the output in the correct order.

## Firestore serialization

Generated types include `toFirestore` and `fromFirestore` methods that handle:

- **Date fields**: encode/decode via passed timestamp functions
- **Tagged fields**: call nested `Type.toFirestore()`/`Type.fromFirestore()`
- **LookupTable fields**: serialize as `{ id: fullObject }` maps for efficient Firestore queries
- **Arrays of Tagged**: recursive `.map()` calls at each nesting level

The underscore-prefix pattern (`_toFirestore`, `_fromFirestore`) allows types to define custom public methods that
delegate to the generated ones.

## Key design decisions

1. **Normalize early**: Parse once to descriptors, generate from descriptors. No re-parsing during codegen.
2. **Separate concerns**: Each codegen module handles one output section.
3. **Orchestrator assembles**: `tagged-type-generator.js` calls modules and concatenates results.
4. **Preserve user code**: `imports` and `functions` from source files pass through unchanged.
5. **No runtime dependency on generator**: Generated code imports only `@graffio/cli-type-generator` runtime helpers.

## Future capabilities (enabled by this architecture)

- **Phase 4**: Reorganize TaggedSum output (group by concern, not by variant)
- **Phase 5**: Default values for optional fields in `from()`
