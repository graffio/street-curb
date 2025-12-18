# cli-type-generator Rewrite

## Goal

Separate parsing from code generation so that:
1. Generated output structure can be reorganized without touching parsing logic
2. New generation features (default values, alternate layouts) are easy to add
3. Code is easier to read and reason about

## Current State

- `FieldDescriptor` and `TypeDescriptor` handle all normalization
- Parser returns pre-normalized `TypeDescriptor` objects
- Codegen modules in `src/codegen/` generate specific concerns
- `tagged-type-generator.js` (~540 lines) orchestrates codegen modules
- `tagged-field-type.js` deleted (obsolete)
- Phases 4 and 5 are now enabled by the separation of concerns

## Architecture

```
Input (type.js file)
    ↓
Parse → TypeDescriptor (normalized representation)
    ↓
Codegen modules (each generates one concern)
    ↓
Orchestrator (assembles output in desired order)
    ↓
Output (generated.js file)
```

### TypeDescriptor Schema

```
// For Tagged types
{
    kind: 'Tagged',
    name: 'Account',
    relativePath: 'modules/curb-map/types/account.type.js',
    fields: {
        id: FieldDescriptor,
        balance: FieldDescriptor,
    },
    childTypes: ['Category'],      // Types referenced in fields (for imports)
    needsLookupTable: false,       // Whether any field uses LookupTable

    // Preserved from source file
    imports: [ImportInfo],
    functions: [FunctionInfo],
}

// For TaggedSum types
{
    kind: 'TaggedSum',
    name: 'View',
    relativePath: 'modules/quicken-web-app/types/view.type.js',
    variants: {
        Register: {
            fields: {
                id: FieldDescriptor,
                accountId: FieldDescriptor,
                title: FieldDescriptor,
            },
            childTypes: [],  // Per-variant for targeted imports
        },
        Report: {
            fields: {
                id: FieldDescriptor,
                reportType: FieldDescriptor,
                title: FieldDescriptor,
            },
            childTypes: [],
        },
    },
    needsLookupTable: false,       // Type-wide (affects file-level imports)

    // Preserved from source file
    imports: [ImportInfo],
    functions: [FunctionInfo],
}
```

### Codegen Modules

Each module takes TypeDescriptor and returns code strings:

```
codegen/
  constructor.js     - generateConstructor(descriptor) → String
  prototype.js       - generatePrototype(descriptor) → String
  toString.js        - generateToString(descriptor, variantName?) → String
  toJSON.js          - generateToJSON(descriptor, variantName?) → String
  serialization.js   - generateToFirestore(descriptor), generateFromFirestore(descriptor)
  is-method.js       - generateIsMethod(descriptor) → String
  imports.js         - generateImports(descriptor) → String
```

### Benefits

1. **Reorganization is trivial**: To group all toStrings together in TaggedSum output, change the orchestrator - not codegen
2. **Default values**: Add to IR schema, codegen modules read from IR
3. **Testing**: Each codegen module can be unit tested in isolation
4. **Readability**: Each file does one thing

## Phases

### Phase 2: TypeDescriptor + Normalize Early

**Goal**: Create descriptor for entire type definition, normalize at parse time.

**Scope**:
- Rename `src/ir/` → `src/descriptors/`, `FieldTypeIR` → `FieldDescriptor`
- Create `src/descriptors/type-descriptor.js`
- Normalize fields to FieldDescriptor during parsing
- Compute `childTypes` (per-variant for TaggedSum) and `needsLookupTable` once
- Update generators to read from descriptor instead of calling `TaggedFieldType.fromString`

**Files**:
- RENAME: `src/ir/field-type-ir.js` → `src/descriptors/field-descriptor.js`
- RENAME: `test/field-type-ir.tap.js` → `test/field-descriptor.tap.js`
- NEW: `src/descriptors/type-descriptor.js`
- NEW: `test/type-descriptor.tap.js`
- MODIFY: `src/parse-type-definition-file.js` (normalize to descriptor)
- MODIFY: `src/tagged-type-generator.js` (read from descriptor)

**Verification**:
- All existing tests pass
- No calls to `TaggedFieldType.fromString` in `tagged-type-generator.js`

### Phase 3: Extract Codegen Modules

**Goal**: Move code generation into focused modules.

**Scope**:
- Extract `generateToString` → `src/codegen/to-string.js`
- Extract `generateToFirestore/FromFirestore` → `src/codegen/serialization.js`
- Extract `generateVariantConstructor` pieces → `src/codegen/variant.js`
- Keep orchestrator in `tagged-type-generator.js`

**Files**:
- NEW: `src/codegen/to-string.js`
- NEW: `src/codegen/serialization.js`
- NEW: `src/codegen/variant.js`
- MODIFY: `src/tagged-type-generator.js` (import and call modules)

**Verification**:
- All existing tests pass
- `tagged-type-generator.js` reduced to orchestration only

### Phase 4: Reorganize TaggedSum Output

**Goal**: Group related code in TaggedSum output (all toStrings together, etc.)

**Scope**:
- Update orchestrator to generate by concern, not by variant
- Output structure: prototypes → constructors → toStrings → toJSONs → serialization

**Verification**:
- All existing tests pass
- Generated TaggedSum files have new structure

### Phase 5: Support Default Values

**Goal**: Enable `from({ partial })` with defaults for missing fields.

**Scope**:
- Add `defaultValue` to FieldTypeIR
- Update `generateFrom` to use defaults
- Add syntax for specifying defaults in type definitions

**Verification**:
- New tests for default value behavior
- Existing tests pass

## Not In Scope

- Import path resolution (R4) - no concrete need currently
- AST-based codegen - string templates work fine once separated
- Runtime changes - focus on generator only

## Completed

### Phase 1: FieldDescriptor Foundation (Done)

- Created `src/ir/field-type-ir.js` (to be renamed to `src/descriptors/field-descriptor.js`)
- Normalized field types to descriptor format
- Updated `generateTypeCheck` and `generateAssignment` to use descriptors
- All tests pass

### Phase 2: TypeDescriptor + Normalize Early (Done)

- Renamed `src/ir/` → `src/descriptors/`, `FieldTypeIR` → `FieldDescriptor`
- Created `src/descriptors/type-descriptor.js` with `normalize()` function
- Parser now returns pre-normalized `TypeDescriptor` objects
- Computed `childTypes` and `needsLookupTable` at parse time
- Eliminated all `TaggedFieldType.fromString` calls in generators
- All tests pass

### Phase 3: Extract Codegen Modules (Done)

- Created `src/codegen/` with 6 focused modules:
  - `to-string.js` - toString method generation
  - `to-json.js` - toJSON method generation
  - `serialization.js` - Firestore toFirestore/fromFirestore field expressions
  - `is-method.js` - TaggedSum .is() method
  - `imports.js` - import statement generation
  - `constructor-sig.js` - @sig comments for constructors
- `tagged-type-generator.js` reduced from ~790 to ~540 lines
- Added `FieldDescriptor.toSyntax()` to restore concise comment format
- Deleted obsolete `tagged-field-type.js`
- All tests pass

### Phase 4: Reorganize TaggedSum Output (Done)

- Reorganized from per-variant to per-concern grouping
- Converted variant toString/toJSON to object literals with `// prettier-ignore`
- Aligned colons in toString/toJSON objects based on longest variant name
- Grouped static methods by type (all .prototype, then .is, then .toString, etc.)
- Added section headers for each static method group
- Created `src/codegen/variant.js` for variant prototype/static method generation
- Created `src/codegen/firestore-serialization.js` for Firestore serialization
- All tests pass
