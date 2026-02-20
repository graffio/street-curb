---
summary: "Pure TanStack tree rendering for report pages with TaggedSum node types and node-type-aware cell renderers"
keywords: [ "report", "TanStack", "tree", "TaggedSum", "CategoryReport", "InvestmentReport", "columns", "expand" ]
module: quicken-web-app
last_updated: "2026-02-20"
---

# Report Pages

Unified pure-tree rendering pattern for hierarchical report pages.

## Pattern

Both report pages (Category, Investment) use the same rendering strategy:

1. **TaggedSum node types** — each tree has a two-variant type:
   - `CategoryTreeNode`: `Group` (category aggregate) / `Transaction` (individual transaction)
   - `HoldingsTreeNode`: `Group` (holding aggregate) / `Holding` (individual position)

2. **Tree transform** — a `toGroupNode` function recursively converts plain `aggregateTree` output into typed nodes,
   exploding each node's `value` array into leaf-variant children

3. **Node-type-aware columns** — cell renderers dispatch on variant using `.is()` predicates:
   - `P.isTransactionRow(row)` / `P.isHoldingRow(row)` for cell-level branching
   - Group rows show aggregates + expand/collapse chevron
   - Leaf rows show individual record fields

4. **Column visibility** — hide redundant columns based on `groupBy` dimension via TanStack's `columnVisibility` prop

## Data Flow

```
transactions → groupBy → buildTree → aggregateTree → .map(toGroupNode) → [TaggedSum nodes]
                                                                              ↓
                                                          DataTable ← useSelector(tree)
                                                              ↓
                                                    getSubRows: row.children
                                                    cell renderers dispatch on node type
```

## Key Files

| File | Purpose |
|------|---------|
| `type-definitions/category-tree-node.type.js` | CategoryTreeNode TaggedSum definition |
| `type-definitions/holdings-tree-node.type.js` | HoldingsTreeNode TaggedSum definition |
| `src/utils/category-tree.js` | Tree building + toGroupNode transform for category report |
| `src/utils/holdings-tree.js` | Tree building + toGroupNode transform for investment report |
| `src/columns/CategoryReportColumns.jsx` | Node-type-aware column definitions for category report |
| `src/columns/InvestmentReportColumns.jsx` | Node-type-aware column definitions for investment report |
| `src/pages/CategoryReportPage.jsx` | Category report page wiring |
| `src/pages/InvestmentReportPage.jsx` | Investment report page wiring |

## Gotchas

- **Transaction.transaction is `Object`, not `Transaction`** — enriched transactions lose their Tagged identity when
  spread in `Transaction.toEnriched`. The type definition uses `'Object'` validation accordingly.
- **Null amounts** — some transactions (splits, transfers) have null amounts. The `collectTransactionTotals` aggregator
  uses `amount ?? 0` to prevent NaN propagation.
- **Uniform `children` field** — both Group and leaf variants have a `children` field (always `[]` for leaves). This
  enables uniform tree traversal without variant checking.
