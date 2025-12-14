# Backlog

## Claude Workflow

1. [ ] Why didn't Claude know about `record completion`? What do we need to do to keep it aware of workflow.md?
2. [ ] Is episodic memory working at all? Claude didn't use it this session despite instructions

## Validator updates

3. [x] find functions with @sig but no comment and vice versa
4. [ ] find multi-line calls that could be shorter by introducing new variables
5. [x] Style change: Multiline functions need blank line above; single-line functions grouped without blank lines
6. [ ] Update multiline functions not preceded by blank line
7. [ ] Identify chains a.b.c that should trigger variable introduction to get d.c
8. [x] @sig should always be last in a block of comments
11. [ ] Every comment block needs blank line above it

## Code generation

9. [ ] Modify type generator to handle optional regexes imported from FieldTypes
10. [ ] Generate code that complies with style validator
