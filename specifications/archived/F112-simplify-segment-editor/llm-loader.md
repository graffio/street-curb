# LLM Loader for F112 – Simplify SegmentedCurbEditor

**CRITICAL**: Read and follow this specification before simplifying the SegmentedCurbEditor component.

This specification defines the plan to simplify the SegmentedCurbEditor by removing horizontal orientation support, consolidating event handling, and decomposing into smaller components to prepare for Radix Themes migration.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines all simplification rules, component structure, and task breakdown
3. `tests.yaml`: Validation examples showing before/after code structure

**WARNING**: This simplification must preserve all existing functionality while reducing complexity by ~60%. 