# Reporting Framework: Vision

## Three Capability Types

| Type | Examples | Input → Output | Key Difference |
|------|----------|----------------|----------------|
| **Report** | Category spending, portfolio view, net worth | Historical data → Aggregated views | Transform existing data |
| **Simulation** | Retirement planning, debt payoff timeline | Current state + assumptions → Future snapshots | Project forward |
| **Optimization** | Rebalancing trades, debt payoff order | Current state + target/goal → Suggested actions | Prescribe actions |

**Hybrid example (Rebalancing):**
1. Report current vs target allocation
2. Optimize suggested trades to close gap
3. Optional: execute trades

**Stateful tracking** (capital gains, tax planning) is derived state that reports consume, not a capability type itself.

---

## Plugin Mental Model

"Plugin" is a documentation pattern, not a runtime architecture. Each report/simulation/optimization is described as:

```javascript
Plugin = {
  id: String,
  name: String,
  type: 'report' | 'simulation' | 'optimization',
  inputSchema: WhatDataDoINeed,
  configSchema: WhatCanUserConfigure,
  compute: (data, config) → Output,
  render: (output, config, actions) → ReactElement,
}
```

Extract shared architecture after 2-3 implementations, not before.

---

## UI Component Layers

### Design System Primitives

`@graffio/design-system`: DataTable, Flex, Card, Select, DatePicker, Tabs, SplitPane, Panel, Charts (future)

### Report-Specific Components

`@graffio/quicken-web-app/components`:

| Component | Purpose |
|-----------|---------|
| **HierarchicalTable** | DataTable + expand/collapse via TanStack getSubRows |
| **FilterBar** | Date range + account + category pickers |
| **ReportWorkspace** | Multi-panel layout for complex reports |
| **TransactionList** | Selectable transaction rows |
| **BalanceSummary** | Key metrics display |

---

## Module Locations

| Concern | Location |
|---------|----------|
| Banking computations | `@graffio/financial-computations` |
| Tree utilities | `@graffio/functional` (tree.js) |
| UI components | `quicken-web-app/src/components/` |

---

## Known Gaps

- Large datasets (50K+ transactions): pagination, virtualization
- URL state for shareable report configs
- Export (CSV, PDF)
- Comparison mode (year-over-year)
