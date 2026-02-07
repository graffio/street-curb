# Tree Operations API

Build trees from flat hierarchical data (e.g., categories `food:restaurant:lunch`).

## Functions

| Function        | Signature                                       | Description                  |
|-----------------|-------------------------------------------------|------------------------------|
| `buildTree`     | `((k -> k?), {k: v}) -> [TreeNode]`             | Build tree from flat groups  |
| `aggregateTree` | `((v, [agg]) -> agg, [TreeNode]) -> [TreeNode]` | Compute aggregates bottom-up |
| `flattenTree`   | `((TreeNode, depth) -> a, [TreeNode]) -> [a]`   | Flatten tree depth-first     |

## TreeNode Shape

```javascript
{ key: String, value: a, children: [TreeNode], aggregate?: b }
```

## Example

```javascript
// Caller provides getParent function (derive from path, lookup table, etc.)
const getParent = key => {
    const idx = key.lastIndexOf(':')
    return idx === -1 ? null : key.slice(0, idx)
}

const groups = { food: [...], 'food:restaurant': [...] }
const tree = buildTree(getParent, groups)

const aggregated = aggregateTree(
    (items, childAggs) => sum(items) + sum(childAggs),
    tree,
)

const flat = flattenTree(
    (node, depth) => ({ name: node.key, depth }),
    aggregated,
)
```

**Reference:** `modules/functional/src/tree.js`
