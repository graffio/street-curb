# Agent Workflow Patterns Implementation

**Date:** 2025.07.27  
**Purpose:** Technical protocols for agent collaboration and handoffs

## Standard Three-Agent Sequence

### **Phase 1: Strategic Analysis**
**Agent:** tech-lead-complexity-reducer  
**Input:** Requirements specification + current codebase
**Tasks:**
- Analyze complexity reduction opportunities  
- Create detailed simplification plan
- Identify implementation priorities
- Assess risks and trade-offs

**Output:** `.claude/artifacts/[task]/complexity-analysis.md`

### **Phase 2: Implementation Cycles**
**Agent:** tdd-implementer  
**Input:** Complexity analysis + coding standards
**Tasks:**
- Test current behavior first
- Implement changes in small increments
- Follow strict red-green-refactor cycle
- Create implementation log

**Output:** Code changes + `.claude/artifacts/[task]/implementation-log.md`

### **Phase 3: Quality Validation**
**Agent:** code-reviewer  
**Input:** Implementation changes + success criteria  
**Tasks:**
- Verify complexity reduction achieved
- Check adherence to coding standards
- Validate test coverage
- Assess architectural integrity

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
3. **New artifacts** build on previous work
4. **User updates** between phases when needed

## Quality Gates

### **After tech-lead Analysis**
- [ ] Clear simplification plan exists
- [ ] Implementation steps prioritized
- [ ] Success criteria defined
- [ ] Risk assessment complete

### **After Each Implementation Cycle**
- [ ] Tests pass for implemented changes
- [ ] Coding standards followed
- [ ] No regressions introduced
- [ ] Progress toward overall goal

### **Before Final Completion**
- [ ] All success criteria met
- [ ] Code review approves changes
- [ ] No outstanding issues
- [ ] User acceptance obtained