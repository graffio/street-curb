// ABOUTME: Selectors for account list UI preferences
// ABOUTME: Sort mode and collapsed sections state
// COMPLEXITY: cohesion-structure - both selectors serve account list UI state (sort mode and collapsed sections)

// Returns the account list sort mode preference
// @sig accountListSortMode :: State -> SortMode
const accountListSortMode = state => state.accountListSortMode

// Returns collapsed section IDs
// @sig collapsedSections :: State -> Set<String>
const collapsedSections = state => state.collapsedSections

export { accountListSortMode, collapsedSections }
