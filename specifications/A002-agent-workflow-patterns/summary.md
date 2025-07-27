# Agent Workflow Patterns Summary

**Date:** 2025.07.27  
**Purpose:** Define how specialized agents collaborate on complex tasks

## Core Decision
Use orchestrated agent sequences for multi-step development work:
- **tech-lead-complexity-reducer** - Strategic analysis and simplification planning
- **tdd-implementer** - Test-driven implementation in small cycles
- **code-reviewer** - Quality validation after each implementation step

## Key Patterns
1. **Strategic → Implementation → Review** - Standard three-agent sequence
2. **Micro-cycles** - tdd-implementer → code-reviewer → tdd-implementer until complete
3. **Escalation** - Any agent can escalate complex decisions back to tech-lead
4. **Artifact handoffs** - Agents communicate through shared markdown files

## Success Criteria
- Clear handoff protocols between agents
- No redundant work or agent conflicts
- Quality gates maintained at each step
- User approval points clearly defined