# UI/Business Logic Separation Summary

**Date:** 2025.07.27  
**Purpose:** Extract business logic from UI components to improve testability and reduce complexity

## Core Decision
Move ~200+ lines of business logic from SegmentedCurbEditor and CurbTable into Redux store and pure utility functions:
- **Extract:** Segment operations, position calculations, validation logic
- **Keep in UI:** Event handling, rendering, user interaction
- **Create:** Testable selectors and pure functions for complex operations

## Key Constraints
- **No breaking changes** - All component APIs remain identical
- **Mathematical invariant preserved** - All business rules enforced in Redux
- **Maintain performance** - Use memoized selectors for expensive calculations
- **Backwards compatibility** - All existing tests continue to pass

## Implementation Targets
1. **Redux Store**: Add segment operations (split, addLeft), derived selectors (startPositions, tickPoints)
2. **SegmentedCurbEditor**: Remove business logic from handlers, simplify to presentation-only
3. **CurbTable**: Extract position calculations, use Redux selectors
4. **Utils**: Create pure functions for visual calculations and geometry helpers

## Success Criteria
- Move 200+ lines of business logic to testable functions
- Reduce component complexity by 40-50%
- Enable comprehensive unit testing of business operations
- Maintain identical UI behavior and performance