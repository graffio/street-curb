# Claude Project Guide

## Quick Start
New Claude sessions should read this file to understand project standards and workflows.

## REQUIRED: Read These Specification Files First
Before starting any work, you MUST read these files in order:

1. **A001-coding-standards**: `specifications/A001-coding-standards/llm-loader.md` - Functional JavaScript patterns, testing with node-tap, formatting rules
2. **A002-claude-workflow**: `specifications/A002-claude-workflow/llm-loader.md` - When to use direct implementation vs. strategic discussion vs. developer subagent  
3. **A005-commit-format**: `specifications/A005-commit-format/llm-loader.md` - Conventional commit format and testing requirements
4. **A006-specification-standards**: `specifications/A006-specification-standards/llm-loader.md` - How to read/write specifications

## Context Renewal
If this guide gets lost in context window, ask user: "Should I refresh my understanding of project standards by re-reading CLAUDE.md?"

## Key Commands
- Tests: `yarn tap` or `tap ...tap.js`
- Build: Check package.json for build scripts
- Package manager: Use `yarn` not `npm`

## Workflow Decision Tree
1. **Simple Tasks**: Direct implementation (typos, obvious fixes, small features)
2. **Complex Implementations**: Strategic discussion → delegated implementation with developer subagent
3. **Architecture Discussions**: Collaborative analysis focusing on simplification opportunities
4. **Code Reviews**: Analysis with discussion, standards compliance focus

## Developer Subagent
- **When**: Complex implementations where separate context beneficial
- **How**: `Task(description="...", subagent_type="developer")`
- **Output**: Writes to `.claude/developer-output.md`
- **Claude must**: Always read and present subagent findings to user

## Core Principles
- Strategic collaboration on architecture decisions
- Claude works naturally without artificial personas
- Use subagent when implementation scope justifies separate context
- Always present subagent work, never hide results from user
- Reference specifications rather than duplicating content
