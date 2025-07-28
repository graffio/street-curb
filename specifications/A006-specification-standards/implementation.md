# Specification Standards Implementation

**Date:** 2025.07.27  
**Purpose:** Technical guidelines for writing consistent specifications

## File Structure Requirements

### **Directory Naming**
- **Architecture specs**: `A001-brief-name` through `A099-brief-name`
- **Feature specs**: `F100-brief-name` and incrementing  
- Use `kebab-case`: `A001-coding-standards`, `F100-ui-simplification`
- Keep names descriptive but concise

### **File Naming Convention**
- `summary.md` - Always present, contains core decisions
- `implementation.md` - Technical implementation details
- `testing.md` - Test strategy and requirements
- `[descriptive-name].md` - Additional analysis files

### **Required Files**
1. **summary.md** - Essential for every specification (30-50 lines max)
2. **implementation.md** - Required for features involving code changes (focused, 100-200 lines typical)
3. **testing.md** - Required for features with testable behavior (50-100 lines max)

### **Length Guidelines**
- **summary.md**: Core decisions only, 30-50 lines maximum
- **implementation.md**: Focused technical details, avoid bloat
- **testing.md**: Key scenarios only, 50-100 lines maximum  
- **Brevity over completeness**: Better to have focused, readable specs

### **Optional Files**
- `senior-tech-lead-review.md` - Post-implementation analysis
- `ui-requirements.md` - UI-specific requirements
- `api-design.md` - API specifications
- `performance-requirements.md` - Performance criteria

## Content Guidelines

### **Header Format (All Files)**
```markdown
# [Feature Name] [File Type]

**Date:** YYYY.MM.DD  
**Purpose:** Brief description of document purpose
**Context:** Optional - why this document exists
```

### **Summary.md Structure**
1. **Core Decision** - Primary architectural choice
2. **Key Constraints** - Mathematical invariants, business rules, technical limitations
3. **Success Criteria** - Measurable completion criteria
4. **Cross-References** - Links to related specifications

### **Implementation.md Structure**
1. **Technical Architecture** - System design, data flow
2. **API Specifications** - Function signatures, data structures
3. **Integration Points** - How feature connects to existing system
4. **Edge Cases** - Known limitations and boundary conditions

### **Testing.md Structure**
1. **Test Strategy** - Overall approach (unit, integration, e2e)
2. **Test Scenarios** - Specific test cases with Given/When/Then
3. **Success Criteria** - What constitutes passing tests
4. **Test Data** - Required test fixtures or data sets

## Specification Evolution

### **Original Specifications**
- Never modify original specs once implemented
- Preserve historical context and decisions
- Mark as "superseded" if replaced, with links to new versions

### **Specification Lifecycle**
```
specifications/
├── F100-ui-simplification/       # Active feature spec
│   ├── summary.md
│   ├── implementation.md
│   └── testing.md
└── archived/
    └── F100-ui-simplification/   # Moved after completion
        ├── summary.md
        ├── implementation.md
        ├── testing.md
        └── completion-notes.md    # Why archived, lessons learned
```

### **Cross-Referencing**
- Use format: `@A001-coding-standards` or `@F100-ui-simplification`
- Reference specific files: `@A001-coding-standards/implementation.md`
- Update all cross-references when renaming/archiving specs

## Writing Standards

### **Technical Accuracy**
- Include exact function signatures with @sig annotations
- Provide working code examples
- Specify data types and constraints
- Reference actual file paths and line numbers when applicable

### **Clarity Requirements**
- Write for developers unfamiliar with the feature
- Include context for decisions ("Why X instead of Y")
- Use concrete examples over abstract descriptions
- Define domain-specific terms

### **Consistency Rules**
- Follow @A001-coding-standards/implementation.md for code examples
- Use consistent terminology across all specs
- Maintain same header format across all files
- Use same markdown style and structure

## Quality Criteria

### **Completeness Checklist**
- [ ] Core decisions clearly stated
- [ ] Success criteria measurable
- [ ] Integration points identified
- [ ] Edge cases documented
- [ ] Test scenarios defined

### **Review Requirements**
- Specifications should be reviewable by other developers
- Technical details should be implementable without additional research
- Test scenarios should be runnable
- Success criteria should be verifiable