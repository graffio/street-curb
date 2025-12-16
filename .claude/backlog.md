# Backlog

## Claude Workflow

1. [x] Why didn't Claude know about `record completion`? What do we need to do to keep it aware of workflow.md?
2. [x] Is episodic memory working at all? Claude didn't use it this session despite instructions

## Validator updates

3. [x] find functions with @sig but no comment and vice versa
4. [ ] find multi-line calls that could be shorter by introducing new variables
5. [x] Style change: Multiline functions need blank line above; single-line functions grouped without blank lines
6. [ ] Update multiline functions not preceded by blank line
7. [x] Identify chains a.b.c that should trigger variable introduction to get d.c
8. [x] @sig should always be last in a block of comments
11. [x] Every comment block needs blank line above it (via @stylistic/lines-around-comment)

## Code generation

9. [~] Rewrite type generator with IR-based architecture (spec: `specifications/cli-type-generator-rewrite/`)
    - [x] Phase 1: FieldTypeIR foundation + optional FieldTypes fix
    - [ ] Phase 2: ImportIR + import resolution
    - [ ] Phase 3: TypeDefinitionIR + complete normalization
    - [ ] Phase 4: FunctionIR + code generation
    - [ ] Phase 5: Testing infrastructure
    - [ ] Phase 6: Integration
10. [x] Generate code that complies with style validator
