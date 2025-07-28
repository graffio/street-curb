# Specification Standards Summary

**Date:** 2025.07.27  
**Purpose:** Define consistent specification format for project features

## Core Structure
Each specification lives in its own numbered directory:
```
specifications/
├── A001-coding-standards/       # Architecture specs (A001-A099)
├── A002-agent-workflow/
├── F100-ui-simplification/      # Feature specs (F100+)
├── F101-business-separation/
└── archived/                    # Completed/abandoned specs
    └── F100-ui-simplification/
```

## Naming Convention
- **Architecture specs**: `A001-brief-name` through `A099-brief-name`
- **Feature specs**: `F100-brief-name` and incrementing
- **Archived**: Completed/abandoned specs moved to `archived/` folder
- **References**: Use `@A001-coding-standards` format in documentation

## File Length Standards
- **summary.md** - 30-50 lines max (core decisions only)
- **implementation.md** - Focused technical specs (100-200 lines typical)
- **testing.md** - Key test scenarios (50-100 lines max)

## Summary File Format
1. **Header**: Date, purpose (2-3 lines)
2. **Core Decision**: Primary choice (3-5 lines)
3. **Key Constraints**: Critical limitations (3-5 lines)
4. **Success Criteria**: Measurable goals (3-5 lines)

## Evolution Pattern
- Sequential numbering preserves logical order
- Completed specs archived to maintain clean structure
- Cross-reference using `@ANNN-name` or `@FNNN-name` format