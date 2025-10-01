# Comparison: .llm/ vs .llm2/

## Key Differences

### Architecture Integration
| Aspect | .llm/ | .llm2/ |
|--------|-------|--------|
| **Architecture Context** | Embedded in F107 files | Referenced from `docs/architecture/` |
| **Implementation Details** | Mixed with architecture | Separated in specification phase files |
| **Reusability** | Limited to F107 | Reusable across specifications |
| **Maintainability** | Single source of truth | Clear separation of concerns |

### Template Updates
| Template | .llm/ | .llm2/ |
|----------|-------|--------|
| **Context** | Basic repo snapshot | Includes architecture doc references |
| **SOP** | Standard procedure | Enhanced with architecture guidelines |
| **Task Prompts** | Basic context fields | Architecture + implementation context |
| **Design Templates** | Generic ADR process | Architecture-aware ADR process |

### File Structure
| Component | .llm/ | .llm2/ |
|-----------|-------|--------|
| **Core Files** | 6 files | 8 files (+ migration guide, README) |
| **Validation** | Manual | Automated validation script |
| **Documentation** | Basic | Comprehensive with examples |
| **Migration Support** | None | Full migration guide |

## Benefits of .llm2/

### 1. **Better Architecture Integration**
- Clear references to `docs/architecture/` files
- Separation between patterns and implementation
- Reusable architectural knowledge

### 2. **Improved Maintainability**
- Single source of truth for architectural patterns
- Easier to update architectural decisions
- Clear separation of concerns

### 3. **Enhanced Workflow**
- Better context for LLM prompts
- Architecture-aware decision making
- Clearer guidance for different types of work

### 4. **Migration Support**
- Clear migration path from `.llm/`
- Validation tools to ensure correctness
- Rollback plan if issues arise

## Migration Path

### Phase 1: Parallel Operation
- Keep both `.llm/` and `.llm2/` available
- Use `.llm2/` for new work
- Gradually migrate existing processes

### Phase 2: Full Migration
- All new work uses `.llm2/`
- Validate workflow with real tasks
- Fix any issues that arise

### Phase 3: Cleanup
- Remove `.llm/` directory
- Update any remaining references
- Complete migration

## Validation

The `.llm2/` workflow includes:
- ✅ Automated validation script
- ✅ Architecture reference checking
- ✅ Specification reference checking
- ✅ Template structure validation
- ✅ Sample prompts for testing

## Rollback Plan

If issues arise with `.llm2/`:
1. Continue using `.llm/` for immediate work
2. Fix issues in `.llm2/` based on feedback
3. Gradually migrate to `.llm2/` once stable
4. Remove `.llm/` only after full validation

## Conclusion

`.llm2/` represents a significant improvement over `.llm/` in terms of:
- Architecture integration
- Maintainability
- Workflow clarity
- Migration support

The new workflow is designed to work seamlessly with the extracted architecture documentation and provides a clear path for future development work.
