# Coding Standards Summary

**Date:** 2025.07.24  
**Purpose:** Define functional JavaScript coding standards for project

## Core Decision
Embrace functional programming paradigms with strict anti-TypeScript stance:
- **Never use** object-oriented keywords (`class`, `new`)
- **Always prefer** functional patterns (`map`, `reduce`, `filter`)
- **No TypeScript ever** - plain JavaScript with runtime validation only
- **Single indentation level** - no nested conditionals

## Key Constraints
- Maximum line length: 120 characters
- Use home-grown functional library (not Ramda)
- PropTypes for React components, @sig for functions
- node-tap testing with Given/When/Then structure
- Yarn package manager, not npm

## Success Criteria
- All code follows functional programming principles
- No TypeScript syntax or file extensions (.ts, .tsx)
- Single export statement per file
- @sig annotations on all top-level functions