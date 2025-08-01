/*
 * Reindent the multiline string s by stripping the same number of blanks off the front of each line of s
 * and then adding newIndentation to the front of each row of the result
 * The number of blanks to remove is determined by the row with the shortest prefix of blanks -- ignoring blank lines
 *
 * @sig reindent :: (String, String) -> String
 */
const reindent = (newIndentation, s) => {
    // extend all rows with blanks to prevent short rows of all-blanks from scrambling the longest-prefix computation
    const blanks = ''.padEnd(150, ' ')
    const rows = s.split('\n').map(row => row + blanks)

    const blankPrefixes = rows.map(s => s.match(/^ */)) // preliminary blanks for each row
    const lengthOfLongestBlankPrefix = Math.min(...blankPrefixes.map(r => r[0].length))
    const longestBlankPrefix = ''.padEnd(lengthOfLongestBlankPrefix, ' ')
    const rowsWithoutLongestPrefix = rows.map(r => r.replace(new RegExp('^' + longestBlankPrefix), ''))
    const trimmedRows = rowsWithoutLongestPrefix.map(r => r.trimEnd())
    const rowsWithNewIndentation = trimmedRows.map(r => newIndentation + r)
    return rowsWithNewIndentation.join('\n')
}

export default reindent
