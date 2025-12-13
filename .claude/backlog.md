# Backlog

Items deferred from Tab Groups implementation (2025-12-13):

## Tooling

## Claude Workflow

10. [ ] Why didn't Claude know about `record completion`? What do we need to do to keep it aware of workflow.md?
11. [ ] Is episodic memory working at all? Claude didn't use it this session despite instructions

## Validator updates

15. [ ] find functions with @sig but no comment and vice versa
16. [ ] find multi-line calls that could be shorter by introducing new variables
8. [ ] Style change: Multiline functions need blank line above; single-line functions grouped without blank lines
17. [ ] Update multiline functions not preceded by blank line
18. [ ] Identify chains a.b.c that should trigger variable introduction to get d.c
19. [ ] @sig should always be last in a block of comments

## Code generation

7. [ ] Modify type generator to handle optional regexes imported from FieldTypes
20. [ ] Generate code that complies with style validator
