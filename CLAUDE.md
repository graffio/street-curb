# Claude Project Guide

## Quick Start
New Claude sessions should read this file to understand project standards and workflows.

## Coding Standards (A001)
- **Language**: Functional JavaScript only, no classes, no TypeScript
- **Documentation**: Sig annotations required for all functions
- **Testing**: Node TAP with given-when-then proper English descriptions  
- **Formatting**: Single indentation, 120 char lines, proper structure
- **Package manager**: Use `yarn` not `npm` for all commands

## Workflow Patterns (A002)
Choose the right approach based on task complexity:

### Simple Tasks
- **When**: Simple bugs, typos, minor changes, obvious fixes, small features
- **Approach**: Direct implementation
- **Steps**: Analyze → Implement → Test → Commit

### Complex Implementations  
- **When**: Specifications, complex features, multi-file changes
- **Approach**: Strategic discussion then delegated implementation
- **Steps**: Discuss → Analyze → Propose strategy → Get approval → Use developer subagent → Present results

### Architecture Discussions
- **When**: Complexity concerns, refactoring decisions, design choices
- **Approach**: Collaborative analysis
- **Focus**: Simplification opportunities, tradeoffs, system impact

### Code Reviews
- **When**: Review completed work, validate changes, pre-commit review
- **Approach**: Analysis with discussion  
- **Focus**: Standards compliance, quality assessment

## Developer Subagent
- **When to use**: Complex implementations where separate context beneficial
- **How to invoke**: `Task(description="...", subagent_type="developer")`
- **Output**: Writes to `.claude/developer-output.md`
- **Claude must**: Always read and present subagent findings to user

## Commit Standards (A005)
- Use conventional commit format
- Always run tests before committing
- Include co-authored by Claude signature

## Key Commands
- Tests: `yarn tap` or `tap ...tap.js`
- Build: Check package.json for build scripts

## Specification Format (A006)
When reading or creating specifications in `specifications/` folder:
- **meta.yaml**: System metadata (spec_id, name, file list)
- **llm-loader.md**: Instructions for Claude on how to interpret the spec
- **logic.yaml**: Implementation rules/data (use natural language strings, not underscore_values)
- **tests.yaml**: Validation examples (optional)

## Core Principles
- Strategic collaboration on architecture decisions
- Claude works naturally without artificial personas
- Use subagent when implementation scope justifies separate context
- Always present subagent work, never hide results from user
