// ABOUTME: Selectors for UI preferences (account list, etc.)
// ABOUTME: Sort mode and collapsed sections state

// Returns the account list sort mode preference
// @sig sortMode :: State -> SortMode
const sortMode = state => state.accountListSortMode

// Returns collapsed section IDs
// @sig collapsedSections :: State -> Set<String>
const collapsedSections = state => state.collapsedSections

const Prefs = { sortMode, collapsedSections }

export { Prefs }
