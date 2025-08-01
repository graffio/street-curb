/**
 * When passed function f, return a new function f' with the same signature as f. f' will delegate to f
 * unless this call has identical arguments to the last call, in which case f' returns the previous result
 *
 * @sig memoizeOnceWithIdenticalParams :: (Fn -> Fn)
 *  Fn = (...Any) -> *
 */
const memoizeOnceWithIdenticalParams = fn => {
    let lastArgs
    let lastResult

    return (...args) => {
        // Check if we have a cached result and all args are identical
        if (lastArgs && lastArgs.length === args.length && lastArgs.every((arg, i) => arg === args[i]))
            return lastResult

        // Cache miss - compute new result
        lastArgs = args
        lastResult = fn(...args)
        return lastResult
    }
}

export default memoizeOnceWithIdenticalParams
