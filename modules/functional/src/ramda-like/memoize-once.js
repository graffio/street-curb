/*
 * Given function f, return another function that will cache exactly one previous result of calling f
 * As long as the arguments are "the same" as they were last time we called f.
 *
 * "The same" is defined by calling cacheKeyF with the arguments to F each time.
 */

const memoizeOnce = (cacheKeyF, f) => {
    let previousValue
    let previousCacheKey

    return (...args) => {
        const cacheKey = cacheKeyF(...args)

        if (previousCacheKey !== cacheKey) {
            previousCacheKey = cacheKey
            previousValue = f(...args)
        }

        return previousValue
    }
}

export default memoizeOnce
