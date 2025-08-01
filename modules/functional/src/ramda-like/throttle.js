/*
 * Return a function g that calls f only once after ms milliseconds, no matter how many times g is called while waiting
 * If g is called multiple times, the arguments to the FINAL call to g will be passed to f
 * @sig throttle :: (Number, * -> *) -> * -> *
 */
const throttle = (ms, f) => {
    let isScheduled
    let capturedArgs

    return (...args) => {
        // we always capture the latest arguments whether we're going to call f or not
        capturedArgs = args

        // if we've already scheduled a call, then just capture the latest args to pass along to f later
        if (isScheduled) return

        isScheduled = true
        setTimeout(() => {
            f.apply(undefined, capturedArgs)
            isScheduled = false // safe to schedule a new call
        }, ms)
    }
}

export default throttle
