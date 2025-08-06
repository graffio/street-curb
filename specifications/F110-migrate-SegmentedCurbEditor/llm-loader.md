# LLM Loader for F110 – Migrate SegmentedCurbEditor to Design System

This specification defines the safe migration of SegmentedCurbEditor components from inline styles to the @qt/design-system using Radix Themes and Vanilla Extract.

## How to Use This Specification
1. Load all specification files
2. Check execution_status.current_task for the next task
3. Execute ONLY the current task
4. Update execution_status with results
5. STOP and wait for human guidance to proceed

## Load Order
1. **A001-coding-standards**: CRITICAL - All code must follow A001 standards
2. `meta.yaml`: Provides spec metadata and file roles
3. `logic.yaml`: Defines migration tasks, components, implementation rules, and execution status
4. `tests.yaml`: Validation cases to ensure migration correctness

## Execution Instructions
- Execute ONLY the current task identified in execution_status.current_task
- Complete all validation criteria for the current task
- Update execution_status section with results
- STOP and report completion to human
- Do NOT proceed to next task without human instruction

## Context
- Source: SegmentedCurbEditor components in modules/right-of-way-editor/src/components/SegmentedCurbEditor/
- Target: Design system integration with @qt/design-system
- Approach: Task-level migration with rollback capability
- Coding Standards: Must follow A001 functional JavaScript patterns

## Key Principles
- Zero visual regressions
- Maintain all existing functionality
- Preserve performance characteristics
- Follow functional programming patterns (A001)
- Use Vanilla Extract for CSS-in-JS
- Integrate with Radix Themes
- Theme integration from day one
- Design system tokens used throughout

## Coding Standards Requirements (A001)
- Functional JavaScript ONLY - no classes, no TypeScript
- @sig annotations required for ALL functions
- Node TAP testing with given-when-then descriptions
- Single indentation level maximum
- 120 character line limits
- Use yarn, not npm
- Early returns, no nested conditionals

## Current Status
Check execution_status section in logic.yaml for current task and progress. 