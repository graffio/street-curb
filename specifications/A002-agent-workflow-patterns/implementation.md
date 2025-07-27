# Agent Workflow Patterns Implementation

**Date:** 2025.07.27  
**Purpose:** Technical protocols for agent collaboration and handoffs

## Standard Three-Agent Sequence

### **Phase 1: Strategic Analysis**
**Agent:** tech-lead-complexity-reducer  
**Input:** Requirements specification + current codebase
**Tasks:**
- **FIRST**: Read @A001-coding-standards for project requirements
- Analyze complexity reduction opportunities  
- Create detailed simplification plan
- Identify implementation priorities
- Assess risks and trade-offs
- **Test Strategy**: Plan comprehensive test approach including cleanup of trivial tests

**Output:** `.claude/artifacts/[task]/complexity-analysis.md`

### **Phase 2: Implementation Cycles**
**Agent:** tdd-implementer  
**Input:** Complexity analysis + coding standards
**Tasks:**
- **FIRST**: Read @A001-coding-standards, especially test requirements  
- **Test Cleanup**: Remove trivial tests that only verify JavaScript works
- **TDD RED Phase**: Create stub files with intentionally wrong return values (not missing imports)
- **TDD GREEN Phase**: Implement minimal code to pass tests
- **TDD REFACTOR Phase**: Optimize while keeping tests green
- **Handoff Summary**: Clearly state what was accomplished for next agent

**Output:** Code changes + `.claude/artifacts/[task]/implementation-log.md`

### **Phase 3: Quality Validation**
**Agent:** code-reviewer  
**Input:** Implementation changes + success criteria  
**Tasks:**
- **Handoff Summary**: Acknowledge what was received from previous agent
- **Coding Standards Verification**: Check ALL standards including file formatting, functional style
- **Test Quality Review**: Verify proper English, meaningful assertions, business logic validation
- **Architectural Assessment**: Evaluate file organization and separation of concerns
- **Mathematical Invariant Check**: Verify business rules preserved (if applicable)
- **Go/No-Go Decision**: Clear recommendation for proceeding

**Output:** `.claude/artifacts/[task]/review-report.md`

## Micro-Cycle Pattern

For complex implementations, use tight feedback loops:
```
tdd-implementer: Implement small change
code-reviewer: Review just that change  
✅ Approved → tdd-implementer: Next change
❌ Issues → tdd-implementer: Fix issues
```

## Escalation Protocols

### **When to Escalate to tech-lead**
- Architectural decisions beyond agent scope
- Conflicting requirements discovered
- Major design pattern changes needed
- Performance/security concerns

### **When to Return to User**
- Breaking changes that affect user workflows
- Multiple valid approaches need decision
- Scope changes required
- Agent disagreement on approach

## Artifact Management

### **Shared Context Files**
```
.claude/artifacts/[task-name]/
├── requirements.md           # Original specifications
├── complexity-analysis.md    # Tech lead output
├── implementation-log.md     # TDD implementer progress
└── review-report.md         # Code reviewer assessment
```

### **Handoff Protocol**
1. **Receiving agent** reads all previous artifacts
2. **Previous artifacts** provide full context
3. **Receiving agent** explicitly summarizes what they received
4. **New artifacts** build on previous work
5. **User updates** between phases when needed

### **Test Management Protocol**
- **Proactively remove** tests that only verify JavaScript language features work
- **Consolidate** duplicated test logic across multiple files
- **Focus tests** on actual business logic and edge cases
- **Use proper English** in all test descriptions per @A001-coding-standards

## Quality Gates

### **After tech-lead Analysis**
- [ ] Clear simplification plan exists
- [ ] Implementation steps prioritized
- [ ] Success criteria defined
- [ ] Risk assessment complete

### **After Each Implementation Cycle**
- [ ] Tests pass for implemented changes
- [ ] ALL coding standards followed (formatting, functional style, test English)
- [ ] No regressions introduced
- [ ] Mathematical invariants preserved (if applicable)
- [ ] Progress toward overall goal
- [ ] Clear handoff summary provided

### **Before Final Completion**
- [ ] All success criteria met
- [ ] Code review approves changes
- [ ] No outstanding issues
- [ ] User acceptance obtained