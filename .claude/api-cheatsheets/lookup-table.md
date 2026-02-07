# LookupTable API

Array with id-based lookup. Items accessible by index OR by id.

```javascript
const table = LookupTable(items, ItemType, 'id')
table[0]            // by index
table['abc123']     // by id
table.get('abc123') // same, preferred
```

## Methods

| Method             | Signature                       | Description                       |
|--------------------|---------------------------------|-----------------------------------|
| `get`              | `id -> Item?`                   | Get by id                         |
| `filter`           | `pred -> LookupTable`           | Filter (returns LookupTable)      |
| `sort`             | `cmp -> LookupTable`            | Sort (returns LookupTable)        |
| `pick`             | `[ids] -> LookupTable`          | Select by ids                     |
| `addItem`          | `(item, sort?) -> LookupTable`  | Add item                          |
| `addItemWithId`    | `(item, sort?) -> LookupTable`  | Add or replace by id              |
| `removeItem`       | `item -> LookupTable`           | Remove item                       |
| `removeItemWithId` | `id -> LookupTable`             | Remove by id                      |
| `toggleItem`       | `(item, sort?) -> LookupTable`  | Add if missing, remove if present |
| `updateAll`        | `(Item -> Item) -> LookupTable` | Transform all items               |
| `updateWhere`      | `(pred, fn) -> LookupTable`     | Transform matching items          |
| `moveElement`      | `(from, to) -> LookupTable`     | Reorder                           |
| `prepend`          | `item -> LookupTable`           | Add to front                      |
| `includesWithId`   | `id -> Bool`                    | Has item with id?                 |
| `hasItemEqualTo`   | `item -> Bool`                  | Has equal item?                   |

## Key Rules

- Use `.get(id)` for lookup — not bracket access or `.find()`
- All mutating methods return a new LookupTable (immutable)
- Prefer LookupTable over plain array when type is Tagged or TaggedSum
- Type syntax in definitions: `'{Type:idField}'`

**Reference:** `modules/functional/src/lookup-table.js`
