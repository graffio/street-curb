# LookupTable

**When:** Collection of items with unique IDs needing both iteration and O(1) lookup.

**Where:** Redux state, selector returns, any domain collection.

**Instead of:**

```js
const accounts = [{ id: 'a1', name: 'Checking' }, { id: 'a2', name: 'Savings' }]
const found = accounts.find(a => a.id === 'a1')  // O(n)
```

**Use:**

```js
const accounts = LookupTable([...], Account, 'id')
const found = accounts['a1']  // O(1)
accounts.map(a => ...)        // Still iterable
```

**Key rules:**
- Use `.get(id)` for lookup, not bracket access or `.find()`
- Prefer LookupTable over plain array when contained type is Tagged or TaggedSum
- Type syntax: `'{Type:idField}'` for LookupTable, `'[Type]'` for plain array

**Full API:** See `api-cheatsheets/lookup-table.md`

**Reference:** `modules/functional/src/lookup-table.js`
