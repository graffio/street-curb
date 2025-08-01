import keys from './keys.js'
import type from './type.js'

// hasOwnProperty with reversed parameter order
const _has = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop)

/*
 * Return the name of f
 * @sig (* -> *) -> String
 */
const _functionName = f => {
    // String(x => x) evaluates to "x => x", so the pattern may not match.
    const match = String(f).match(/^function (\w*)/)
    return match == null ? '' : match[1]
}

/*
 * "Unlazy" an iterator by returning all its values as a list
 * @sig _arrayFromIterator :: Iterator a -> [a]
 */
const _arrayFromIterator = iterator => {
    const result = []
    let next
    while (!(next = iterator.next()).done) result.push(next.value)
    return result
}

/*
 * Does list contain a value? Unlike "contains," the "value" is calculated as part of f
 * @sig _includesWith :: (Predicate, b, [a]) -> Boolean
 *  Predicate = (b, a) -> Boolean
 */
const _includesWith = (f, x, list) => {
    const len = list.length
    for (let i = 0; i < len; i++) if (f(x, list[i])) return true
    return false
}

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparison of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */
const _uniqContentEquals = (aIterator, bIterator, stackA, stackB) => {
    const a = _arrayFromIterator(aIterator)
    const b = _arrayFromIterator(bIterator)

    const eq = (_a, _b) => _equals(_a, _b, stackA.slice(), stackB.slice())

    // if *a* array contains any element that is not included in *b*
    return !_includesWith((b, aItem) => !_includesWith(eq, aItem, b), b, a)
}

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles cyclical data structures.
 *
 * @func
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */
function _equals(a, b, stackA, stackB) {
    // identical
    if (Object.is(a, b)) return true

    const typeA = type(a)

    // different types
    if (typeA !== type(b)) return false

    // one is a null
    if (a == null || b == null) return false

    // if both a and b happen to have an 'equals' function and a equals b and b equals a
    if (typeof a.equals === 'function' || typeof b.equals === 'function')
        return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a)

    switch (typeA) {
        case 'Arguments':
        case 'Array':
        case 'Object':
            // two promises are equal iff they're identical (?)
            if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') return a === b
            break
        case 'Boolean':
        case 'Number':
        case 'String':
            // same types plus identity check on values
            if (!(typeof a === typeof b && Object.is(a.valueOf(), b.valueOf()))) return false
            break
        case 'Date':
            // identity check on values
            if (!Object.is(a.valueOf(), b.valueOf())) return false
            break
        case 'Error':
            // identity check on values
            return a.name === b.name && a.message === b.message
        case 'RegExp':
            // every regex field matches
            if (
                !(
                    a.source === b.source &&
                    a.global === b.global &&
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline &&
                    a.sticky === b.sticky &&
                    a.unicode === b.unicode
                )
            ) {
                return false
            }
            break
    }

    // if a appears in stackA, b has to appear in the same index of stackB (to handle cyclical dependencies?)
    for (let i = stackA.length - 1; i >= 0; i--) if (stackA[i] === a) return stackB[i] === b

    switch (typeA) {
        case 'Map':
            // recurse through map's entries
            if (a.size !== b.size) return false
            return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]))
        case 'Set':
            // recurse through map's values
            if (a.size !== b.size) return false
            return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]))
        case 'Arguments':
        case 'Array':
        case 'Object':
        case 'Boolean':
        case 'Number':
        case 'String':
        case 'Date':
        case 'Error':
        case 'RegExp':
        case 'Int8Array':
        case 'Uint8Array':
        case 'Uint8ClampedArray':
        case 'Int16Array':
        case 'Uint16Array':
        case 'Int32Array':
        case 'Uint32Array':
        case 'Float32Array':
        case 'Float64Array':
        case 'ArrayBuffer':
            break
        default:
            // Values of other types are only equal if identical.
            return false
    }

    // objects have different number of keys
    const keysA = keys(a)
    if (keysA.length !== keys(b).length) return false

    const extendedStackA = stackA.concat([a])
    const extendedStackB = stackB.concat([b])

    // recurse through object keys
    for (let i = keysA.length - 1; i >= 0; i--) {
        const key = keysA[i]
        if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) return false
    }

    // must be equal
    return true
}

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles cyclical data structures.
 * Dispatches symmetrically to the `equals` methods of both arguments, if present.
 *
 * @func
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */
const equals = (a, b) => _equals(a, b, [], [])

export default equals
