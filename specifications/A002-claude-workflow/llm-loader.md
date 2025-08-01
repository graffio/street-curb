# LLM Loader for A002 – Claude Workflow and Developer Subagent

**CRITICAL FOR ALL CLAUDE SESSIONS**: This specification defines natural Claude workflow patterns and 1 developer subagent for complex implementations. Claude works naturally and delegates complex implementation to the developer subagent when appropriate.

## Essential Reading Order for New Claude Sessions
1. **@A001-coding-standards/llm-loader.md** - Core development standards (READ FIRST)
2. **@A005-commit-format/llm-loader.md** - Git commit format standards
3. **@A006-specification-standards/llm-loader.md** - How to read YAML specifications  
4. **@A002-claude-workflow/logic.yaml** - THIS FILE - Workflow patterns and subagent usage

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: **CRITICAL** - Defines 4 workflow patterns and developer subagent usage
3. `tests.yaml`: Optional examples of effective workflow pattern usage

## Workflow Patterns
Claude chooses appropriate workflow based on task complexity:
- **simple_tasks** - Direct implementation for bugs, small changes, obvious fixes
- **complex_implementations** - Strategic discussion then delegated implementation for specifications and large features  
- **architecture_discussions** - Collaborative analysis for design decisions and complexity concerns
- **code_reviews** - Analysis with discussion for quality assessment and standards validation

## Developer Subagent
- **Single subagent**: `developer` for complex implementations requiring separate context
- **Output file**: `.claude/developer-output.md` (overwritten each time, visible to you)
- **Usage**: Claude invokes when implementation scope justifies separate context

**Key Principle**: Strategic thinking stays visible, complex implementation gets delegated to subagent, Claude always presents subagent findings to you.