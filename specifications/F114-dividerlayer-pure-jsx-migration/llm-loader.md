# LLM Loader for F114 – SegmentedCurbEditor Pure JSX Migration

This specification defines the migration of the entire SegmentedCurbEditor component ecosystem from CSS-dependent styling to pure JSX elements using Radix Theme components.

## Context
- SegmentedCurbEditor components expect major changes (start-point editing, new interaction modes)
- Entire ecosystem depends on CSS classes from index.css for visual styling
- Components include: DividerLayer, SegmentRenderer, LabelLayer, SegmentedCurbEditor, DragDropHandler
- Pure JSX approach chosen for maximum flexibility in future LLM-driven changes
- Functional equivalence required, NOT pixel-perfect visual fidelity
- New component props interfaces acceptable (new architecture, new contracts)
- TDD approach: Storybook stories define behavior before implementation

## Load Order
1. `meta.yaml`: Specification metadata and dependencies
2. `logic.yaml`: Task-level implementation details and validation
3. `tests.yaml`: Validation test cases for visual and functional correctness

## Architecture Decision
**Pure JSX Elements Over CSS**: All visual elements implemented as JSX components using Radix Theme Box components and CSS variables. No external CSS dependencies. This maximizes flexibility for future LLM-driven changes.

**Migration Strategy**: Bottom-up by component dependencies:
1. DividerLayer (most independent) → 2. SegmentRenderer → 3. DragDropHandler → 4. LabelLayer → 5. SegmentedCurbEditor (most dependent)

**TDD Process**: Create Storybook stories FIRST to define expected behavior, then implement components to satisfy stories.

## Execution Model
- This is a **task-level specification**
- Execute ONLY the current task identified in execution_status.current_task
- Each task: Write story → Implement component → Validate → Mark COMPLETED
- Update execution_status section with results
- STOP after each task and report completion to human
- Do NOT proceed to next task without human instruction

## Success Criteria
- Functional equivalence to original components (user workflows still work)
- Zero CSS class dependencies for styling
- All components testable in isolation via Storybook
- Integration with existing Redux store and event handlers preserved