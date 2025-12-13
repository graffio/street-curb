# Backlog

Items deferred from Tab Groups implementation (2025-12-13):

## Code Quality
1. [x] ~~Fix pre-existing coding standard violations in `modules/quicken-web-app/src/pages/TransactionRegisterPage.jsx`~~
2. [x] ~~TabGroup.jsx has functions not at top level - fix ordering~~
3. [x] ~~Refactor/simplify `modules/quicken-web-app/src/store/reducer.js`~~

## Architecture
4. [x] ~~Consolidate hydration handling - why is it in post.js still? Should be with reducer.js or hydration module~~
5. [x] ~~Rename `groups` to `tabGroups` and `activeGroup` to `activeTabGroup` throughout~~
6. [ ] Question: Why are functions pulled to module level rather than inside their parent functions?

## Tooling
7. [ ] Modify type generator to handle optional regexes imported from FieldTypes
8. [ ] Style change: Multiline functions need blank line above; single-line functions grouped without blank lines
9. [ ] Rewind commits (add to git workflow)

## Claude Workflow
10. [ ] Why didn't Claude know about `record completion`? What do we need to do to keep it aware of workflow.md?
11. [ ] Is episodic memory working at all? Claude didn't use it this session despite instructions
12. [x] ~~Style validator and reread reminder moved to git pre-commit hook + UserPromptSubmit hook~~
13. [x] ~~Hooks now in pre-commit (validation) + UserPromptSubmit (reread flag)~~
14. [x] ~~@.claude/commit-changes.md is not being used when commiting as part of the workflow in @.claude/workflow.md~~

## Validator updates

15. [ ] find functions with @sig but no comment and vice versa
16. [ ] find multi-line calls that could be shorter by introducing new variables
17. [ ] Update multiline functions not preceded by blank line
18. [ ] Identify chains a.b.c that should trigger variable introduction to get d.c
19. [ ] @sig should always be last in a block of comments

## Code generation

20. [ ] Generate code that complies with style validator
