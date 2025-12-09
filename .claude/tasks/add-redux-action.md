# Add Redux Action

Add a new action using Tagged types (not string literals).

## Prerequisites

Module must have `type-definitions/action.type.js`. If not, create it first:
```javascript
export const Action = {
    name: 'Action',
    kind: 'taggedSum',
    variants: {
        // Add variants here
    }
}
```

New modules also need an entry in `modules/cli-type-generator/type-mappings.js`:
```javascript
const sources = {
    // ...
    myModule: `${REPO_ROOT}/modules/my-module/type-definitions`,
}

const targets = {
    // ...
    myModule: `${REPO_ROOT}/modules/my-module/src/types`,
}

export const typeMappings = {
    // ...
    [`${sources.myModule}/action.type.js`]: [targets.myModule],
}
```

## Steps

1. **Add variant** to `type-definitions/action.type.js`:
   ```javascript
   variants: {
       ExistingAction: { ... },
       NewAction: { fieldName: 'Type', otherField: 'Type?' },
   }
   ```

2. **Run generator**: `yarn types:generate modules/<module>/type-definitions/action.type.js`

3. **Add reducer case** using `action.match()`:
   ```javascript
   // Old pattern (don't use):
   case 'NEW_ACTION': return { ...state, ...action.payload }

   // New pattern:
   return action.match({
       NewAction: ({ fieldName }) => ({ ...state, fieldName }),
       _: () => state
   })
   ```

4. **Create action creator** (if needed for dispatch convenience):
   ```javascript
   import { Action } from '../types/action.js'
   const newAction = fieldValue => Action.NewAction(fieldValue)
   ```

5. **Update dispatch calls**: `dispatch(Action.NewAction(value))`

## Field Type Syntax

- `'String'`, `'Number'`, `'Boolean'`, `'Object'`, `'Date'` - primitives
- `'String?'`, `'Number?'` etc. - optional primitives
- `'Type'` - reference to another Tagged type
- `'Type?'` - optional Tagged type
- `'{Type:idField}'` - LookupTable (preferred over arrays)
- `'[Type]'` - array (use LookupTable instead when items have IDs)
- `/regex/` - string matching pattern

## Rules

- No string literals for action types
- All actions defined in type-definitions/, not inline
- Run `types:generate <file>` after any change to type definitions
- Prefer LookupTable over arrays for collections with IDs
