# Consolidating Workflows: A Proposal for Solo Developer LLM Integration

## Current State Analysis

The graffio-monorepo has three distinct approaches to LLM integration:

1. **`.llm/`** - Human-driven daily workflow with templates and guardrails
2. **`docs/standards/specification-format/`** - LLM-executable task management system
3. **`F107-firebase-soc2-vanilla-app/`** - Rich, human-readable specification with implementation details

## Key Findings

### What Works

- **`.llm/`** aligns best with current solo developer practices (test-first, patch-sized changes, human control)
- **`F107`** contains valuable architectural context and implementation guidance (~100KB of useful content)
- **`docs/standards/specification-format/`** provides good task granularity and status tracking concepts

### What Doesn't Work

- **`docs/standards/specification-format/`** is over-engineered for solo developers (LLM-centric execution, complex YAML)
- **`F107`** lacks structured workflow for daily operations
- **`.llm/`** lacks strategic context and task management

## Proposed Solution: Hybrid Three-Layer System

### Layer 1: Specification Governance (docs/standards/specification-format/ + templates/specification-template/)

**Purpose**: Define standards for all specifications
**Files**:

- `docs/standards/specification-format/` - Meta-standard defining structure
- `templates/specification-template/` - Templates for new specifications

**Structure**:

```yaml
# docs/standards/specification-format/logic.yaml
specification_structure:
  required_files:
    - README.md: "Overview and quick start"
    - architecture.md: "Technical architecture"
    - decisions.md: "Decision rationale"
    - implementation.md: "Implementation phases"
    - tasks.yaml: "Task breakdown"
  optional_files:
    - setup.md: "Manual setup instructions"
    - testing.md: "Testing strategy"
    - migration.md: "Migration procedures"
    - phase-*.md: "Detailed phase implementations"
```

### Layer 2: Knowledge Base (Architecture + F107-style, Standardized)

**Purpose**: Rich context and implementation guidance
**Files**:

- `docs/architecture/` - Enduring architectural/design narrative (one file per major concern)
- F107 content reorganized to standard structure
  **Key**: Preserve all valuable content while separating architecture from implementation

### Layer 3: Daily Operations (`.llm2/`)

**Purpose**: Human-driven workflow with AI assistance
**Files**:

- `workflow.md` (Human) - Daily process guide
- `templates/` (Human→LLM) - Structured prompts
- `context.yaml` (LLM) - Project context (~200 lines max)
- `tasks.yaml` (Human+LLM) - Task management

## Implementation Strategy

### Phase 1: Define Standards

1. Update docs/standards/specification-format/ to define specification structure
2. Create templates/specification-template/ with templates
3. Document the standard
4. Establish ownership: Primary maintainer with quarterly review cycle

### Phase 2: Extract Architecture

1. Move architectural/design narrative to `docs/architecture/` (one file per major concern)
2. Add `docs/architecture/README.md` describing purpose and ownership
3. Update F107 to reference architecture docs instead of embedding content
4. Track progress with simple checklist to ensure nothing is lost

### Phase 3: Stage F107 Migration

1. Migrate active implementation phases first
2. Preserve explicit links to remaining sections in legacy F107
3. Include migration checklist to verify no content is lost
4. Add tasks.yaml for task management

### Phase 4: Create `.llm2/`

1. Extract daily workflow from `.llm/`
2. Create lightweight templates
3. Link to architecture docs and F107 sections for context
4. Launch `.llm2/` and retire `.llm/` as soon as essentials are ready
5. Rollback plan: Restore `.llm/` from Git history if needed

## Key Principles

1. **Human-driven execution** - docs/standards/specification-format/'s task structure, but humans control progression
2. **Context-aware operations** - `.llm/` templates that reference strategic context
3. **Living documentation** - F107's narrative approach, but updated as work progresses
4. **Test-first discipline** - `.llm/`'s guardrails with docs/standards/specification-format/'s validation patterns
5. **Minimal context** - Keep LLM context small while preserving human knowledge

## File Structure

```
docs/
├── architecture/                    # Enduring architectural narrative
│   ├── README.md                   # Purpose, ownership, linking guide
│   ├── authentication.md           # Auth patterns and decisions
│   ├── deployment.md               # Deployment architecture
│   └── ...

specifications/
├── docs/standards/specification-format/    # Meta-standard
├── templates/specification-template/     # Templates
├── F107-firebase-soc2-vanilla-app/ # Example (migrated)
└── ...

.llm2/                               # Daily workflow (replaces .llm/)
├── workflow.md                      # Human workflow guide
├── templates/                       # LLM prompt templates
├── context.yaml                     # Project context (LLM, ~200 lines max)
└── tasks.yaml                       # Task management (Human+LLM)
```

## Benefits

- **Preserves valuable content** from F107 (~100KB of architectural context)
- **Separates architecture from implementation** for better maintainability
- **Provides structured workflow** for daily operations
- **Enables task management** without over-engineering
- **Maintains human control** while leveraging AI assistance
- **Creates governance** for future specifications with quarterly review cycle
- **Keeps context minimal** for LLM efficiency
- **Prevents drift** by replacing rather than coexisting with `.llm/`
- **Simple rollback** via Git history restoration

## Success Criteria

- All F107 content preserved and accessible
- Architecture separated from implementation for better maintainability
- Clear workflow for daily development
- Consistent structure across all specifications
- Minimal context requirements for LLMs (~200 lines max)
- Human-driven execution with AI assistance
- Test-first discipline maintained
- No drift between `.llm/` and `.llm2/` (replacement, not coexistence)
- Simple rollback capability via Git history

## Risks and Mitigation

**Risk**: Over-engineering the system
**Mitigation**: Keep `.llm2/` minimal, focus on practical workflow

**Risk**: Losing F107's valuable content
**Mitigation**: Reorganize, don't compress; preserve all content

**Risk**: Complex governance overhead
**Mitigation**: Use F107 as example, keep docs/standards/specification-format/ simple

## Next Steps

1. Review and critique this proposal
2. Refine based on feedback
3. Implement Phase 1 (standards definition)
4. Extract architecture to `docs/architecture/`
5. Stage F107 migration in phases
6. Create `.llm2/` workflow system
7. Test with real development work

# Implementation Notes

- **Ownership**: Primary maintainer with quarterly review cycle for docs/standards/specification-format/ and templates/specification-template/ standards
- **Architecture migration**: One file at a time with stubs/links in F107 and simple checklist tracking
- **Transition approach**: Launch `.llm2/` and retire `.llm/` as soon as essentials are ready
- **Rollback plan**: Restore `.llm/` from Git history if needed
