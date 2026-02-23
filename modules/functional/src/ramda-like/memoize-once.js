// ABOUTME: Single-value memoization with custom cache key function
// ABOUTME: Supports scalar and array cache keys (array = element-wise reference comparison)

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {}

// Detects whether current cache key differs from previous (scalar via !==, array via element-wise ===)
// @sig hasCacheKeyChanged :: (Any, Any) -> Boolean
P.hasCacheKeyChanged = (previous, current) => {
    if (!Array.isArray(current)) return previous !== current
    if (!Array.isArray(previous) || previous.length !== current.length) return true
    return !current.every((element, i) => element === previous[i])
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Caches one previous result of f; recomputes only when cacheKeyF produces a different key
// @sig memoizeOnce :: ((…args -> CacheKey), (…args -> a)) -> (…args -> a)
// Caches one previous result of f; recomputes only when cacheKeyF produces a different key
// @sig memoizeOnce :: ((…args -> CacheKey), (…args -> a)) -> (…args -> a)
const memoizeOnce = (cacheKeyF, f) => {
    let previousValue
    let previousCacheKey

    // Returns cached result when cache key is unchanged, otherwise recomputes
    // @sig memoized :: (…args) -> a
    return (...args) => {
        const cacheKey = cacheKeyF(...args)

        if (P.hasCacheKeyChanged(previousCacheKey, cacheKey)) {
            previousCacheKey = cacheKey
            previousValue = f(...args)
        }

        return previousValue
    }
}

export { memoizeOnce }
