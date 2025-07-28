# Claude Session Onboarding

**Date:** 2025.07.27  
**Purpose:** Standard onboarding instructions for new Claude sessions

## Essential Reading Order
1. **@A001-coding-standards/implementation.md** - Core development standards
2. **@A002-agent-workflow-patterns/implementation.md** - Three-agent workflow system
3. **@A006-specification-standards/implementation.md** - Documentation structure

## Critical Constraints
- **Workflow**: Use three-agent sequence: tech-lead-complexity-reducer → tdd-implementer → code-reviewer
- **Commits**: Follow format in @A005-commit-format/


## Agent System Usage
- **CRITICAL**: Use `.claude/agents/` system for all subagents
- **Agent files**: Each agent in `.claude/agents/` includes prompts via `{{include: prompts/filename.md}}`
- **Task tool usage**: Use concise task descriptions that complement included prompts, not replace them
- **Never write verbose custom prompts** - the include system provides focused, tested prompts

### **.claude/agents/ File Structure**
```
.claude/agents/
├── tech-lead-complexity-reducer.md    # Strategic analysis agent
├── tdd-implementer.md                  # Implementation agent  
└── code-reviewer.md                    # Quality validation agent
```

Each agent file contains:
- Agent metadata (name, description, color)
- Single include directive: `{{include: prompts/filename.md}}`
- The include system automatically loads the corresponding prompt from `prompts/` directory

## Getting Started
1. Review current git status and recent commits
2. Use appropriate agent for next task type via Task tool
3. Let the `.claude/agents/` include system handle prompts automatically
4. Follow commit standards when changes are complete
