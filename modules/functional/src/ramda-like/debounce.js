// ABOUTME: Debounce utility for delaying function execution
// ABOUTME: Waits until activity stops before calling the function

// Returns a function that delays calling f until ms milliseconds after the last invocation
// @sig debounce :: (Number, (* -> *)) -> (* -> *)
const debounce = (ms, f) => {
    let timeoutId

    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => f.apply(undefined, args), ms)
    }
}

export default debounce
