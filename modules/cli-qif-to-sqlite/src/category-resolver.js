// ABOUTME: Parses QIF category field syntax into structured components
// ABOUTME: Handles transfers [Account], gain markers (CGLong/CGShort/CGMid), and regular categories

const GAIN_MARKERS = ['CGLong', 'CGShort', 'CGMid']

const P = {
    // Check if category is a transfer to another account (e.g., "[Checking]")
    // @sig isTransfer :: String? -> Boolean
    isTransfer: category => Boolean(category?.startsWith('[') && category?.includes(']')),

    // Check if category is a capital gains marker
    // @sig isGainMarker :: String? -> Boolean
    isGainMarker: category => GAIN_MARKERS.includes(category),

    // Check if category is the split marker used in split transactions
    // @sig isSplitMarker :: String? -> Boolean
    isSplitMarker: category => category === '--Split--',
}

const T = {
    // Extract account name from transfer syntax "[Account]" or "[Account]/Category"
    // @sig toTransferAccountName :: String? -> String?
    toTransferAccountName: category => {
        if (!P.isTransfer(category)) return null
        const closeBracket = category.indexOf(']')
        return category.slice(1, closeBracket)
    },

    // Extract category from transfer syntax "[Account]/Category" -> "Category"
    // @sig toCategoryFromTransfer :: String -> String?
    toCategoryFromTransfer: category => {
        const closeBracket = category.indexOf(']')
        const afterBracket = category.slice(closeBracket + 1)
        return afterBracket.startsWith('/') ? afterBracket.slice(1) : null
    },

    // Extract category name, handling transfers with categories "[Account]/Category"
    // Returns null for pure transfers, gain markers, and split markers
    // @sig toCategoryName :: String? -> String?
    toCategoryName: category => {
        if (!category || P.isGainMarker(category) || P.isSplitMarker(category)) return null
        if (P.isTransfer(category)) return T.toCategoryFromTransfer(category)
        return category
    },
}

const F = {
    // Resolve a category field into its components
    // @sig resolveCategory :: String? -> { categoryName, transferAccountName, gainMarkerType }
    resolveCategory: category => ({
        categoryName: T.toCategoryName(category),
        transferAccountName: T.toTransferAccountName(category),
        gainMarkerType: P.isGainMarker(category) ? category : null,
    }),
}

const CategoryResolver = { P, T, F, GAIN_MARKERS }
export { CategoryResolver }
