/*
 * Map f over a, but return *just* the first non-nil value (rather than one element for each element of a)
 * @sig mapReturningFirst :: (F, [a]) -> b
 *  F = a -> b|undefined
 */
import { isNil } from '../../index.js'

const mapReturningFirst = (f, a) => {
    for (const o of a) {
        const result = f(o)
        if (!isNil(result)) return result
    }

    return undefined
}

export default mapReturningFirst
