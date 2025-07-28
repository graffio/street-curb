# Commit Message Format Summary

**Date:** 2025.07.27  
**Purpose:** Define consistent git commit message standards

## Core Decision
Use conventional commit format with Claude attribution:
- **Format:** `type(scope): description` 
- **Attribution:** End with Claude Code signature and co-author
- **Types:** feat, fix, docs, style, refactor, test, chore

## Key Constraints
- First line under 50 characters for good git log display
- Body text wrapped at 72 characters
- Always include Claude attribution footer
- Use present tense ("add feature" not "added feature")

## Success Criteria
- All commits follow conventional format
- Git history is clean and readable
- Attribution properly credits AI assistance