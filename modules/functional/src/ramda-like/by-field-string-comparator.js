/*
 * Sort function comparator that compares string fields (case-insensitively) of object by a specific field
 * @sig byFieldComparator :: (String, boolean, boolean) -> ({k:String}, {k:String}) -> Number
 */
const byFieldStringComparator = (field, caseSensitive, placeEmptyAtEnd) => (a, b) => {
    const l = caseSensitive ? a[field] : a[field].toLowerCase()
    const r = caseSensitive ? b[field] : b[field].toLowerCase()

    if (placeEmptyAtEnd) {
        if (!l) return 1
        if (!r) return -1
    }

    if (l < r) return -1
    if (l > r) return 1
    return 0
}

export default byFieldStringComparator
