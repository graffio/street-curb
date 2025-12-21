# Reporting Framework Specification

## Documents

| Document                                         | Contents                                              |
|--------------------------------------------------|-------------------------------------------------------|
| [00-vision.md](00-vision.md)                     | Three capability types, plugin pattern, UI components |
| [01-banking.md](01-banking.md)                   | @graffio/financial-computations banking functions     |
| [02-tree-data.md](02-tree-data.md)               | TreeNode pattern, aggregation, TanStack adapter       |
| [03-investments.md](03-investments.md)           | Future: lot tracking, holdings, gains                 |
| [04-user-preferences.md](04-user-preferences.md) | Persisting user data across QIF reimports             |

---

## Key Decisions

1. **Three capability types**: Report, Simulation, Optimization
2. **TreeNode for hierarchies**: Generic tree structure with bottom-up aggregation
3. **TanStack native tree handling**: Use getSubRows instead of flattening to ViewRow
4. **No premature abstraction**: Build 2-3 reports before extracting shared patterns
5. **Storage**: Preserve user tables on QIF reimport

## Module Locations

| Concern              | Location                          |
|----------------------|-----------------------------------|
| Banking computations | `@graffio/financial-computations` |
| Tree utilities       | `@graffio/functional` (tree.js)   |
| Report components    | `quicken-web-app/src/components/` |

## Open Questions

1. **Tags**: Hierarchical or flat?
2. **Asset class source**: Reference data, user-defined, or both?
3. **Aggregates typing**: Fixed shape or report-specific?

## Known Gaps

- Performance for large datasets (pagination, virtualization)
- URL state for shareable configs
- Export (CSV, PDF)
- Comparison mode (year-over-year)
