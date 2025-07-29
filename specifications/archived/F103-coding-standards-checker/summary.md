# F103 Coding Standards Checker Summary

**Date:** 2025.07.28  
**Purpose:** Simple CLI tool to detect and report A001 violations for LLM consumption

## Core Decision
Build minimal CLI tool using acorn AST parser for A001 violation detection:
- **Single file input** - CLI accepts one file path via yargs
- **JSON output** - Structured data optimized for LLM processing
- **Comprehensive reporting** - Report all violations, not just first failure
- **Testable API** - Core checking logic separate from CLI interface

## Key Constraints
- **Parser**: Use `acorn` with `acorn-jsx` plugin for AST parsing
- **CLI**: Simple `node cli.js <filepath>` interface with yargs
- **Output**: JSON format with violation details for LLM consumption
- **Testing**: TDD approach with individual rule testing
- **Scope**: Single file processing only

## Success Criteria
- [ ] CLI accepts single file path and outputs JSON violations
- [ ] API can be tested independently of CLI
- [ ] All major A001 violations detected accurately
- [ ] Zero false positives on existing compliant code
- [ ] Individual rules are testable in isolation

## Cross-References
- **Standards**: @A001-coding-standards/implementation.md - Complete coding standards
- **TDD Process**: @prompts/tdd-implementer.md - Development methodology