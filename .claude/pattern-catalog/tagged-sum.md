# TaggedSum (Discriminated Union)

**When:** Value that can be one of several mutually exclusive variants.

**Where:** Domain types with variants, result types, actions.

**Instead of:**

```js
const result = { type: 'success', value: data }
if (result.type === 'success') { ... }
else if (result.type === 'failure') { ... }
```

**Use:**

```js
const result = Result.Success(data)

result.match({
    Success: ({ value }) => handleSuccess(value),
    Failure: ({ error }) => handleFailure(error),
})
```

**Key rules:**
- Use `.match()` for exhaustive variant handling — compiler-like safety
- Prefer TaggedSum over plain objects with type fields
- All domain entities should be Tagged types

**Reference:** `docs/tagged-types.md`
