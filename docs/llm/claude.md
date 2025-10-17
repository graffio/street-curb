# Claude-Specific Workflow Notes

## Communication Style
- No superlatives unless warranted
- Tool success: One line only ("Commit created: abc123")
- Advice/proposals: Bullets + file:line references, assume domain knowledge
- Technical issues: Problem → options → recommendation (one line why)

## Workflow
1. **Simple Tasks**: Direct implementation
2. **Complex Tasks**: Strategic discussion → developer subagent
3. **Architecture**: Collaborative analysis focusing on simplification

## Developer Subagent
- **When**: Complex implementations needing separate context
- **How**: `Task(description="...", subagent_type="developer")`
- **Output**: `.claude/developer-output.md`
- **Always**: Read and present subagent findings

## Key Commands
- Tests: `yarn tap`
- Package manager: `yarn` (not npm)