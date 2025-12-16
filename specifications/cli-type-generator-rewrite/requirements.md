# cli-type-generator Rewrite Requirements

## Background

The current type generator uses string template concatenation to produce JavaScript code. This approach has accumulated technical debt:
- Multiple code paths for different field types
- Hardcoded values that should be computed
- Inconsistent handling of field type representations (string vs object)
- Style violations in generated code

## Current Issues

### 1. Optional FieldTypes Not Supported

**Problem**: When importing regex patterns from `FieldTypes`, there's no syntax to mark them as optional.

**Current behavior** (line 160-162 of `tagged-type-function-generators.js`):
```javascript
if (typeof fieldType === 'object' && fieldType.__fieldTypesReference)
    return `R.validateRegex(constructorName, ${fieldType.fullReference}, '${name}', false, ${name})`
```

The `false` for optional is hardcoded. The parser creates `__fieldTypesReference` objects with no `optional` property.

**Desired syntax**:
```javascript
// Current (works but can't be optional)
{ phoneNumber: FieldTypes.E164Phone }

// New syntax to support
{ phoneNumber: { pattern: FieldTypes.E164Phone, optional: true } }
```

### 2. Object-Form Field Types Don't Serialize

**Problem**: `generateAssignment` calls `.toString().match(/\?/)` to detect optionals. For object field types, this produces `"[object Object]"`.

**Impact**: Any field type represented as an object (rather than string) cannot be detected as optional by `generateAssignment`.

### 3. Import Path Resolution

**Problem**: When types reference other types in different directories, the import paths may not resolve correctly.

**Example**: A type in `modules/curb-map/types/` referencing `FieldTypes` from `modules/cli-type-generator/` needs correct relative paths in the generated output.

### 4. Style Violations in Generated Code

**Problem**: Generated code doesn't comply with our style validator:
- Missing `@sig` documentation on functions
- Line length violations
- Chain extraction violations

## Proposed Architecture: IR-Based Generation

### Overview

Replace string template concatenation with:
1. **Parse** type definitions into an Intermediate Representation (IR)
2. **Transform** IR as needed
3. **Generate** code from IR using AST construction

### IR Schema (Draft)

```javascript
// Type definition IR
{
    typeName: 'Circle',
    module: 'shapes',
    fields: {
        centre: {
            baseType: 'Coord',
            optional: false,
            arrayDepth: 0,
            taggedType: 'Coord',
            regex: null
        },
        radius: {
            baseType: 'Number',
            optional: false,
            arrayDepth: 0,
            taggedType: null,
            regex: null
        }
    },
    imports: [
        { type: 'Coord', from: './coord.type.js' }
    ]
}
```

### Benefits

- **Single source of truth**: Field type metadata computed once
- **Consistent optional handling**: `optional` property on all field types
- **Testable transforms**: IR → IR transformations can be unit tested
- **AST generation**: No string escaping bugs, proper formatting

## Requirements

### R1: Support Optional FieldTypes

Accept `{ pattern: FieldTypes.X, optional: true }` syntax while preserving all existing syntax:
- `'String'`, `'Number?'`, `'[Account]'`, `'{Account:id}'`
- `FieldTypes.X` (non-optional)
- `/regex/`, `/regex/?`

### R2: Normalize to IR Early

All field type representations should be normalized to a common IR structure immediately after parsing, before any code generation.

### R3: Generate Style-Compliant Code

Generated code must pass the style validator:
- `@sig` documentation on all non-trivial functions
- Line length within limits
- No chain extraction violations
- Proper function ordering

### R4: Resolve Import Paths Correctly

When generating imports for type references:
- Handle same-directory references
- Handle cross-directory references with correct relative paths
- Support `FieldTypes` imports from `cli-type-generator`

### R5: Preserve Existing Tests

All 368 existing tests must pass. The rewrite should be behavior-preserving except for the new features.

### R6: Incremental Adoption

The rewrite should be possible incrementally:
1. Introduce IR parsing
2. Migrate code generation to use IR
3. Replace string templates with AST generation

## Phased Implementation

### Phase 1: IR Layer + Validation Codegen (Current)

**Goal**: Fix optional FieldTypes bug with proper IR foundation that enables future phases.

**Scope**:
- Create `src/ir/field-type-ir.js` - unified field type representation
- Normalize all field type inputs (string, regex, FieldTypes reference, wrapper object) to IR
- Replace `generateTypeCheck` and `generateAssignment` to use IR
- Support `{ pattern: FieldTypes.X, optional: true }` syntax
- All existing tests pass

**Deliverables**:
- FieldTypeIR with: `baseType`, `optional`, `arrayDepth`, `taggedType`, `regex`, `fieldTypesReference`
- `FieldTypeIR.fromString(s)` - parse string syntax
- `FieldTypeIR.fromObject(o)` - parse object syntax (FieldTypes refs, wrappers)
- `FieldTypeIR.fromAny(x)` - unified entry point
- Updated validation codegen using IR

**Files touched**:
- NEW: `src/ir/field-type-ir.js`
- NEW: `test/field-type-ir.tap.js`
- MODIFY: `src/tagged-type-function-generators.js` (use IR)
- MODIFY: `src/parse-type-definition-file.js` (normalize to IR)

### Phase 2: Constructor + Assignment Codegen

**Goal**: Replace remaining string templates in `tagged-type-function-generators.js`.

**Scope**:
- `generateTypeConstructor` uses IR
- `generateFrom` uses IR
- `generateToString` uses IR

### Phase 3: Tagged Type Codegen

**Goal**: Replace `generateStaticTaggedType` with IR-based generation.

**Scope**:
- Create `src/codegen/tagged-type.js`
- Handle imports, ABOUTME, constructor, serialization
- Wire into `cli-api.js`

### Phase 4: TaggedSum Type Codegen

**Goal**: Replace `generateStaticTaggedSumType` with IR-based generation.

**Scope**:
- Create `src/codegen/tagged-sum-type.js`
- Handle variants, `is` method, `match` method
- Per-variant serialization

### Phase 5: Firestore Serialization Codegen

**Goal**: Replace Firestore serialization generators.

**Scope**:
- `generateToFirestore`, `generateFromFirestore`
- `generateVariantFirestoreSerialization`
- `generateTaggedSumFirestoreSerialization`

### Phase 6: Cleanup

**Goal**: Remove legacy modules.

**Scope**:
- Delete `tagged-type-generator.js`
- Delete `tagged-type-function-generators.js`
- Delete `tagged-field-type.js`
- Update exports

## FieldTypeIR Schema

```javascript
{
    // Base type category
    baseType: 'String' | 'Number' | 'Boolean' | 'Object' | 'Date' | 'Any' | 'Tagged' | 'LookupTable',

    // Optional field (can be undefined)
    optional: false,

    // Array nesting depth (0 = not array, 1 = [X], 2 = [[X]])
    arrayDepth: 0,

    // For Tagged/LookupTable: the type name
    taggedType: null | 'Account',

    // For LookupTable: the id field name
    idField: null | 'id',

    // For String with pattern: the regex
    regex: null | /pattern/,

    // For FieldTypes references: preserves the reference for codegen
    fieldTypesReference: null | {
        property: 'E164Phone',
        fullReference: 'FieldTypes.E164Phone'
    }
}
```

**Key insight**: `fieldTypesReference` is separate from `regex` because:
- `regex` would require resolving the pattern at parse time
- `fieldTypesReference` preserves the symbolic reference for generated code
- Generated validation uses `FieldTypes.E164Phone` directly, not the resolved regex

## Related

- Backlog item 9: "Rewrite type generator with IR-based architecture"
- Backlog item 10: "Generate code that complies with style validator" (completed)
