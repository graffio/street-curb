import equals from '../equals.js'

export default function _indexOf(list, a, idx) {
    let inf, item

    switch (typeof a) {
        case 'number':
            if (a === 0) {
                // manually crawl the list to distinguish between +0 and -0
                inf = 1 / a
                while (idx < list.length) {
                    item = list[idx]
                    if (item === 0 && 1 / item === inf) {
                        return idx
                    }
                    idx += 1
                }
                return -1
            }

            // NaN
            // eslint-disable-next-line no-self-compare
            if (a !== a) {
                while (idx < list.length) {
                    item = list[idx]

                    // eslint-disable-next-line no-self-compare
                    if (typeof item === 'number' && item !== item) {
                        return idx
                    }
                    idx += 1
                }
                return -1
            }

            // non-zero numbers can utilise Set
            return list.indexOf(a, idx)

        // all these types can utilise Set
        case 'string':
        case 'boolean':
        case 'function':
        case 'undefined':
            return list.indexOf(a, idx)

        case 'object':
            // null can utilise Set
            if (a === null) return list.indexOf(a, idx)
    }

    // anything else not covered above, defer to R.equals
    while (idx < list.length) {
        if (equals(list[idx], a)) return idx
        idx += 1
    }

    return -1
}
