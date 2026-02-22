// ABOUTME: Parses QIF category field syntax into structured components
// ABOUTME: Handles transfers [Account], gain markers (CGLong/CGShort/CGMid), and regular categories

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const GAIN_MARKERS = ['CGLong', 'CGShort', 'CGMid']

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Check if category is a transfer to another account (e.g., "[Checking]")
// @sig isTransfer :: String? -> Boolean
const isTransfer = category => Boolean(category?.startsWith('[') && category?.includes(']'))

// Check if category is a capital gains marker
// @sig isGainMarker :: String? -> Boolean
const isGainMarker = category => GAIN_MARKERS.includes(category)

// Check if category is the split marker used in split transactions
// @sig isSplitMarker :: String? -> Boolean
const isSplitMarker = category => category === '--Split--'

// Extract account name from transfer syntax "[Account]" or "[Account]/Category"
// @sig toTransferAccountName :: String? -> String?
const toTransferAccountName = category => {
    if (!isTransfer(category)) return undefined
    const closeBracket = category.indexOf(']')
    return category.slice(1, closeBracket)
}

// Extract category name, handling transfers with categories "[Account]/Category"
// Returns undefined for pure transfers, gain markers, and split markers
// @sig toCategoryName :: String? -> String?
const toCategoryName = category => {
    if (!category || isGainMarker(category) || isSplitMarker(category)) return undefined
    if (isTransfer(category)) {
        const closeBracket = category.indexOf(']')
        const afterBracket = category.slice(closeBracket + 1)
        return afterBracket.startsWith('/') ? afterBracket.slice(1) : undefined
    }
    return category
}

// Resolve a category field into its components
// @sig resolveCategory :: String? -> { categoryName, transferAccountName, gainMarkerType }
const resolveCategory = category => ({
    categoryName: toCategoryName(category),
    transferAccountName: toTransferAccountName(category),
    gainMarkerType: isGainMarker(category) ? category : undefined,
})

const CategoryResolver = {
    isTransfer,
    isGainMarker,
    isSplitMarker,
    toTransferAccountName,
    toCategoryName,
    resolveCategory,
}

export { CategoryResolver }
